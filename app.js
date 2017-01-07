var config  = require ('config')
var request = require ('request').defaults( {jar:true} )  // set to retain cookies
var express = require ('express')
var marked  = require ('marked')
var fs      = require ('fs')
var mqtt    = require ('mqtt').connect('mqtt://localhost')
var emitter = new (require ('events').EventEmitter)

// gigaset-elements URLs
const URL_LOGIN   = 'https://im.gigaset-elements.de/identity/api/v1/user/login'
const URL_BASE    = 'https://api.gigaset-elements.de'
const URL_AUTH    = URL_BASE + '/api/v1/auth/openid/begin?op=gigaset'
const URL_EVENTS  = URL_BASE + '/api/v2/me/events?from_ts='
const URL_CAMERA  = URL_BASE + '/api/v1/me/cameras/{id}/liveview/start'
const URL_SENSORS = URL_BASE + '/api/v1/me/basestations'

// ------ AUTHORIZE ------

// authorize every n minutes
function authorize() {
    console.log('authorize')
    request.post(URL_LOGIN, {form: {email: config.get('email'), password: config.get('password')}}, ()=>{
        request.get(URL_AUTH, ()=>{
            emitter.emit('authorized')
        })
    })
    setTimeout(authorize, config.get('auth_interval')*60*1000)
}
authorize()


// ------ PUSH EVENTS TO MQTT ------

// check event every n seconds
var last_ts = Date.now()
var timers = []

function checkEvents() {
    console.log('check events, last_ts=' + last_ts)
    request.get(URL_EVENTS + last_ts, (_, __, body)=>{
        JSON.parse(body).events.reverse().map( (ev)=>{
            last_ts = parseInt(ev.ts) + 1
            console.log('event: ' + ev.o.friendly_name + " / " + ev.type)
            mqtt.publish('gigaset/' + ev.o.friendly_name, (ev.o.type=='ds02' && ev.type=='close') ? 'OFF':'ON')

            // publish a delayed 'OFF' event for motions sensors
            if (ev.type == 'yc01.motion' || ev.type == 'movement') {
                try { clearTimeout( timers[ev.o.friendly_name]) } catch (_) {}
                timers[ev.o.friendly_name] = setTimeout( ()=>{
                    mqtt.publish('gigaset/' + ev.o.friendly_name, 'OFF')
                }, config.get('off_event_delay')*1000)
            }
        })
    })
    setTimeout(checkEvents, config.get('check_events_interval')*1000)
}
emitter.once('authorized', checkEvents)


// ------ WEB SERVER ------

// setup server
var app = express()

// raw api
app.get('/api/*', (req, res)=>{
    request.get(URL_BASE + req.url).pipe(res)
})

// live camera stream
app.get('/live', (_, res)=>{
    request.get(URL_CAMERA.replace('{id}', config.get('camera_id')), (_, __, body)=>{
        try { res.redirect(JSON.parse(body).uri.rtsp) } catch (_) { res.status(410).end() }
    })
})

// sensors
app.get('/sensors', (_, res)=>{
     request.get(URL_SENSORS, (_, __, body)=>{
         res.send( JSON.parse(body)[0].sensors.map( (s)=>{
            return {name: s.friendly_name, status: s.status}
         }) )
     })
 })

// readme
app.get('*', (_, res)=>{
    fs.readFile('README.md', 'utf8', (_, data)=>{
        res.send(marked(data.toString()))
    })
})

// launch server
emitter.once('authorized', ()=>{
    app.listen( config.get('port'), ()=>{ console.log('server listening on http://localhost:' + config.get('port')) })
})
