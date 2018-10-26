#!/usr/bin/env node

// gigaset-elements URLs
const URL_LOGIN = 'https://im.gigaset-elements.de/identity/api/v1/user/login'
const URL_BASE = 'https://api.gigaset-elements.de'
const URL_AUTH = URL_BASE + '/api/v1/auth/openid/begin?op=gigaset'
const URL_EVENTS = URL_BASE + '/api/v2/me/events?from_ts='
const URL_CAMERA = URL_BASE + '/api/v1/me/cameras/{id}/liveview/start'
const URL_SENSORS = URL_BASE + '/api/v1/me/basestations'

// common libs
require('console-stamp')(console, {colors: {stamp: 'grey', label: 'blue'}})
const conf = require('config')
const request = require('request').defaults({jar: true}) // set to retain cookies
const events = require('events')
const synchro = new events.EventEmitter()

// ------ AUTHORIZE ------
{
	// authorize every n minutes
	function authorize() {
		console.info('authorizing')
		request.post(URL_LOGIN, {form: {email: conf.get('email'), password: conf.get('password')}}, () => {
			request.get(URL_AUTH, () => {
				synchro.emit('authorized')
			})
		})
		setTimeout(authorize, conf.get('auth_interval') * 60 * 1000)
	}
	authorize()
}

// ------ PUSH EVENTS TO MQTT ------
{
	const mqtt = require('mqtt').connect(conf.get('mqtt_url'), conf.get('mqtt_options'))
	const timers = new Map() // each motion sensor event gets a timer
	let last_ts = Date.now() // timestamp of the last emited event

	// gigaset to mqtt event map (you can change this section according to your needs)
	function eventMapper(sensor_type, event) {
		switch (sensor_type) {

			case 'ds02': // door sensors
			case 'ws02': // windows sensors
				if (event.type == 'close') return 'false'
				else return 'true'

			case 'ps02': // motion sensor
			case 'ycam': // motion from camera
				return 'true'

			case 'isl01.bs01.intrusion_mode_loaded': // changed security mode
				if (event.o.modeAfter == 'home') return 'false'
				else return 'true'

			default:
				return 'true'
		}
	}

	// check event every n seconds
	function checkEvents() {

		// request new events, treat the oldest first
		request.get(URL_EVENTS + last_ts, (_, __, body) => {
			JSON.parse(body).events.reverse().map(ev => {

				// publish event
				last_ts = parseInt(ev.ts) + 1
				console.log(`acquired event: ${ev.o.friendly_name} | ${ev.o.type} | ${ev.type}`)
				mqtt.publish(`gigaset/${ev.o.friendly_name}`, eventMapper(ev.o.type, ev))

				// publish a delayed 'false' event for motions sensors
				if (ev.type == 'yc01.motion' || ev.type == 'movement') {
					try {
						clearTimeout(timers[ev.o.friendly_name]) // reset (delete) existing timer for motion sensor, if any
					} catch (_) {}
					timers[ev.o.friendly_name] = setTimeout(() => {
						console.log(`generating false event: ${ev.o.friendly_name}`)
						mqtt.publish(`gigaset/${ev.o.friendly_name}`, 'false')
					}, conf.get('off_event_delay') * 1000)
				}
			})
		})
		setTimeout(checkEvents, conf.get('check_events_interval') * 1000) // check again every n seconds
	}
	synchro.once('authorized', checkEvents) // start once authorized
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
		request.get(URL_CAMERA.replace('{id}', conf.get('camera_id')), (_, __, body) => {
			try {
				res.redirect(JSON.parse(body).uri.rtsp)
			} catch (_) {
				res.status(410).end()
			}
		})
	})

	// live camera (local MJPEG stream)
	app.get('/live-local', (_, res) => {
		request.get(`http://admin:${conf.get('camera_password')}@${conf.get('camera_ip')}/stream.jpg`).pipe(res)
	})

	// sensors
	app.get('/sensors', (_, res) => {
		request.get(URL_SENSORS, (_, __, body) => {
			res.send(
				JSON.parse(body)[0].sensors.map(s => {
					return {name: s.friendly_name, status: s.status, position_status: s.position_status}
				})
			)
		})
	})

	// intrusion setting
	app.get('/intrusion_settings', (_, res) => {
		request.get(URL_SENSORS, (_, __, body) => {
			res.send(JSON.parse(body)[0].intrusion_settings.active_mode)
		})
	})

	// readme
	app.get('*', (_, res) => {
		fs.readFile('README.md', 'utf8', (_, data) => {
			res.send(md.render(data.toString()))
		})
	})

	// launch server, once authorized
	synchro.once('authorized', () => {
		app.listen(conf.get('port'), () => {
			console.info(`server listening on http://localhost:${conf.get('port')}`)
		})
	})
}
