#!/usr/bin/env node

// common libs
require('console-stamp')(console, {colors: {stamp: 'grey', label: 'blue'}})
const config = x => require('config').get(x)
const request = require('request').defaults({jar: true}) // set to retain cookies
const events = require('events')
const synchro = new events.EventEmitter()

// common
const VERSION = 'v1.5.3'
const MQTT_TOPIC = 'gigaset/'
const MQTT_TOPIC_BATTERY_SUFFIX = '_battery'

// gigaset-elements URLs
const URL_LOGIN = 'https://im.gigaset-elements.de/identity/api/v1/user/login'
const URL_BASE = 'https://api.gigaset-elements.de'
const URL_AUTH = URL_BASE + '/api/v1/auth/openid/begin?op=gigaset'
const URL_EVENTS = URL_BASE + '/api/v2/me/events?from_ts='
const URL_CAMERA = URL_BASE + '/api/v1/me/cameras/{id}/liveview/start'
const URL_SENSORS = URL_BASE + '/api/v1/me/basestations'

// ------ AUTHORIZE ------
{
	// authorize every n minutes
	function authorize(firstTime = true) {
		if (firstTime) console.info(`gigaset-element-provy ${VERSION} starting`)
		request.post(URL_LOGIN, {form: {email: config('email'), password: config('password')}}, () => {
			request.get(URL_AUTH, () => {
				console.info('authorized on gigaset cloud api')
				if (firstTime) synchro.emit('authorized')
			})
		})
		if (firstTime) setTimeout(authorize, config('auth_interval') * 60 * 1000)
	}
	authorize()
}

// log and try to recover from an unexpected gigaset response (ie. re-authorize)
function handleParsingError(functionName, body)
{
	console.error(functionName + ' | unexpected gigaset response:' + body)
	authorize(false)
}

// ------ PUSH GIGASET EVENTS TO MQTT ------
{
	const mqtt = require('mqtt').connect(config('mqtt_url'), config('mqtt_options'))
	const timers = new Map() // each motion sensor event gets an attached timer
	let last_ts = Date.now() // timestamp of the last emited event
	
	// logs mqtt connection status
	mqtt.stream.on('error', err => {console.error("mqtt initial connection error: ", err)})
	mqtt.on('connect', err => {console.info("mqtt connected")})

	// tell what mqtt topic and value a gigaset event should return
	// you can change this section according to your needs, throw an exception to drop the event
	function gigasetEventMapper(event) {
		let topic = MQTT_TOPIC + event.o.friendly_name

		// basestation events (based on event type)
		switch (event.type) {
			case 'isl01.bs01.intrusion_mode_loaded': // changed security mode
				return [topic, event.o.modeAfter]
			
			case 'battery_critical': // critical battery on sensor
				return [topic + MQTT_TOPIC_BATTERY_SUFFIX, event.type]
		}

		// sensor events (based on sensor type)
		switch (event.o.type) {
			
			case 'ds02': // door sensors
			case 'ws02': // window sensors
				if (event.type == 'close') return [topic, 'false']
				else return [topic, 'true']
			
			case 'ps02': // motion sensor
			case 'ycam': // motion from camera
				return [topic, 'true']

			case 'sp01': // intrusion detected (or acknowledged), siren must turn on (or turn off)
				if (event.type == 'on') return [topic, 'true']
				else return [topic, 'false']

			case 'sd01': // smoke detectors
				if (event.type == 'smoke_detected') return [topic, 'alarm']
				else if (event.type == 'test') return [topic, 'test']
				else return [topic, 'default']

			default: // other events will be dropped (unless stated in the config)
				if (config('allow_unknown_events')) return [topic, event.type]
				else throw 'unhandled event type: ' + event.o.type 
		}
	}
	
	// check new gigaset events
	function checkEvents() {
		
		// request new events, treat the oldest first
		request.get(URL_EVENTS + last_ts, (_, __, body) => {
			try {
				JSON.parse(body).events.reverse().map(ev => {
					
					// publish event
					last_ts = parseInt(ev.ts) + 1
					console.log('acquired event: ' + JSON.stringify(ev))
					try {
						let [topic, value] = gigasetEventMapper(ev)
						mqtt.publish(topic, value)
						console.log(`event sent as mqtt_topic: ${topic}, value: ${value}` )
					}
					catch (e) {console.log ('  event dropped: ' + e)}
					
					// publish a delayed 'false' event after motion is detected
					if (ev.type == 'yc01.motion' || ev.type == 'movement') 
						publishDelayedEvent(ev, `false`, config('off_event_delay') * 1000)
	
					// publish a delayed 'default' event after a smoke detector test
					if (ev.type == 'test' && event.o.type == 'sd01')
						publishDelayedEvent(ev, `default`, config('off_event_delay_after_smoke_detector_test') * 1000)
				})
			} catch (_) {handleParsingError('check events', body)}
		})

		// publish a delayed event of @value after @delay seconds
		function publishDelayedEvent(ev, value, delay) {
			try {
				clearTimeout(timers[ev.o.friendly_name]); // reset (delete) existing timer for motion sensor, if any
			}
			catch (_) { }
			timers[ev.o.friendly_name] = setTimeout(() => {
				console.log(`delayed event sent as mqtt_topic: ${MQTT_TOPIC}${ev.o.friendly_name}, value: ${value}` )
				mqtt.publish(`${MQTT_TOPIC}${ev.o.friendly_name}`, value);
			}, delay);
		}
	}
	
	// send initial states of the sensors
	function sendActualStates() {
		
		// actual status of sensors
		request.get(URL_SENSORS, (_, __, body) => {
			try {
				JSON.parse(body)[0].sensors.map(s => {
					if (s.position_status != null) { // only for sensors that have a status
						console.log(`sending actual state: ${s.friendly_name} | ${s.position_status}`)
						mqtt.publish(`gigaset/${s.friendly_name}`, s.position_status == 'closed' ? 'false' : 'true')
					}
				})
			} catch (_) {handleParsingError('sensor actual status', body)}
		})

		// actual status of alarm mode
		request.get(URL_SENSORS, (_, __, body) => {
			try {
				let base = JSON.parse(body)[0]
				console.log (`sending actual alarm mode: ${base.friendly_name} | ${base.intrusion_settings.active_mode}`)
				mqtt.publish(`gigaset/${base.friendly_name}`, base.intrusion_settings.active_mode)
			} catch (_) {handleParsingError('alarm actual status', body)}
		})
	}

	// once authorized, send initial states of the sensors and start the chekevents loop
	synchro.once('authorized', ()=>{
		setImmediate(sendActualStates)
		setInterval(checkEvents, config('check_events_interval') * 1000) // check again every n seconds
	})
}

// ------ WEB SERVER ------
{
	const md = require('markdown-it')()
	const fs = require('fs')
	const app = require('express')()

	// raw api
	app.get('/api/*', (req, res) => {
		request.get(URL_BASE + req.url).pipe(res)
	})

	// live camera (redirect to a cloud-based RTSP stream)
	app.get('/live', (_, res) => {
		request.get(URL_CAMERA.replace('{id}', config('camera_id')), (_, __, body) => {
			try {
				res.redirect(JSON.parse(body).uri.rtsp)
			} catch (_) {
				handleParsingError('live camera', body)
				res.status(410).end()
			}
		})
	})

	// live camera (local MJPEG stream)
	app.get('/live-local', (_, res) => {
		request.get(`http://admin:${config('camera_password')}@${config('camera_ip')}/stream.jpg`).pipe(res)
	})

	// sensors
	app.get('/sensors', (_, res) => {
		request.get(URL_SENSORS, (_, __, body) => {
			try {
				res.send(
					JSON.parse(body)[0].sensors.map(s => {
						return {name: s.friendly_name, type: s.type, status: s.status, position_status: s.position_status}
					})
				)
			} catch (_) {
				handleParsingError('sensors', body)
				res.status(503).end()
			}
		})
	})

	// send events on mqtt corresponding to actual sensor states
	app.get('/force-refresh', (_, res) => {
		sendActualStates()
		res.send('done')
	})

	// intrusion setting active mode (home, away...)
	app.get('/intrusion_settings', (_, res) => {
		request.get(URL_SENSORS, (_, __, body) => {
			try {
				res.send(JSON.parse(body)[0].intrusion_settings.active_mode)
			} catch (_) {
				handleParsingError('intrusion settings', body)
				res.status(503).end()
			}
		})
	})

	// returns the readme.md as default page
	app.get('*', (_, res) => {
		fs.readFile('README.md', 'utf8', (_, data) => {
			res.send(md.render(data.toString()))
		})
	})

	// launch server, once authorized
	synchro.once('authorized', () => {
		app.listen(config('port'), () => {
			console.info(`server listening on http://localhost:${config('port')}`)
		})
	})
}
