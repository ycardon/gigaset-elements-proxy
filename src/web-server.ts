import { gigasetRequest, handleGigasetError, GIGASET_URL } from './gigaset'
import { sendActualStates } from './mqtt'
import { conf } from './utils'
import fs = require('fs')
import express = require('express')
import markdownIt = require('markdown-it')

// a web-server
const app = express()

// set the route: raw api
app.get('/api/*', (req, res) => {
    gigasetRequest.get(GIGASET_URL.BASE + req.url).pipe(res)
})

// set the route: live camera (redirect to a cloud-based RTSP stream)
app.get('/live', (_, res) => {
    gigasetRequest.get(GIGASET_URL.CAMERA.replace('{id}', conf('camera_id')), (_, __, body) => {
        try {
            res.redirect(JSON.parse(body).uri.rtsp)
        } catch (e) {
            handleGigasetError('live camera', e, body)
            res.status(410).end()
        }
    })
})

// set the route: live camera (local MJPEG stream)
app.get('/live-local', (_, res) => {
    gigasetRequest.get('http://admin:' + conf('camera_password') + '@' + conf('camera_ip') + '/stream.jpg').pipe(res)
})

// set the route: sensors
app.get('/sensors', (_, res) => {
    gigasetRequest.get(GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            res.send(JSON.parse(body)[0].sensors.map((s: gigasetBasestations.ISensorsItem) => {
                return { name: s.friendly_name, type: s.type, status: s.status, position_status: s.position_status }}
            ))
        } catch (e) {
            handleGigasetError('sensors', e, body)
            res.status(503).end()
        }
    })
})

// set the route: send events on mqtt corresponding to actual sensor states
app.get('/force-refresh', (_, res) => {
    sendActualStates()
    res.send('done')
})

// set the route: intrusion setting active mode (home, away...)
app.get('/intrusion_settings', (_, res) => {
    gigasetRequest.get(GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            let base: gigasetBasestations.IRootObjectItem = JSON.parse(body)[0]
            res.send(base.intrusion_settings.active_mode)
        } catch (e) {
            handleGigasetError('intrusion settings', e, body)
            res.status(503).end()
        }
    })
})

// set the route: returns the readme.md as default page
app.get('*', (_, res) => {
    fs.readFile('README.md', 'utf8', (_, data) => {
        res.send(markdownIt().render(data.toString()))
    })
})

// launch the server
export function startWebserver() {
    app.listen(conf('port'), () => {
        console.info('server listening on http://localhost:' + conf('port'))
    })
}
