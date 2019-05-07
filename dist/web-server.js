"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gigaset_1 = require("./gigaset");
const mqtt_1 = require("./mqtt");
const utils_1 = require("./utils");
const fs = require("fs");
const express = require("express");
const markdownIt = require("markdown-it");
// a web-server
const app = express();
// set the route: raw api
app.get('/api/*', (req, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.BASE + req.url).pipe(res);
});
// set the route: live camera (redirect to a cloud-based RTSP stream)
app.get('/live', (_, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.CAMERA.replace('{id}', utils_1.conf('camera_id')), (_, __, body) => {
        try {
            res.redirect(JSON.parse(body).uri.rtsp);
        }
        catch (e) {
            gigaset_1.handleGigasetError('live camera', e, body);
            res.status(410).end();
        }
    });
});
// set the route: live camera (local MJPEG stream)
app.get('/live-local', (_, res) => {
    gigaset_1.gigasetRequest.get('http://admin:' + utils_1.conf('camera_password') + '@' + utils_1.conf('camera_ip') + '/stream.jpg').pipe(res);
});
// set the route: sensors and sensors/id
app.get(['/sensors', '/sensors/:id'], (req, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            let sensors = JSON.parse(body)[0].sensors
                .filter(s => req.params.id ? (s.friendly_name == req.params.id) : true) // match the id if provided
                .filter(s => s.type != 'hb01.hl01' && s.type != 'hb01') // filter out Philips Hue basestation and lights
                .map(s => {
                return {
                    name: s.friendly_name,
                    type: s.type,
                    status: s.status,
                    battery: s.battery != undefined ? s.battery.state : undefined,
                    position_status: s.position_status,
                    href: '/sensors/' + s.friendly_name,
                };
            });
            // on multiple sensors, construct a new object indexed with the name of the sensor ELSE return the only sensor
            if (sensors.length > 1)
                res.send(sensors.reduce((prev, cur) => { prev[cur.name] = cur; return prev; }, {}));
            else
                res.send(sensors[0]);
        }
        catch (e) {
            gigaset_1.handleGigasetError('sensors', e, body);
            res.status(503).end();
        }
    });
});
// set the route: send events on mqtt corresponding to actual sensor states
app.get('/force-refresh', (_, res) => {
    mqtt_1.sendActualStates();
    res.send('done');
});
// set the route: intrusion setting active mode (home, away...)
app.get('/intrusion_settings', (_, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            let base = JSON.parse(body)[0];
            res.send(base.intrusion_settings.active_mode);
        }
        catch (e) {
            gigaset_1.handleGigasetError('intrusion settings', e, body);
            res.status(503).end();
        }
    });
});
// set the route: returns the readme.md as default page
app.get('*', (_, res) => {
    fs.readFile('README.md', 'utf8', (_, data) => {
        res.send(markdownIt().render(data.toString()));
    });
});
// launch the server
function startWebserver() {
    app.listen(utils_1.conf('port'), () => {
        console.info('server listening on http://localhost:' + utils_1.conf('port'));
    });
}
exports.startWebserver = startWebserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLXNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWItc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQTJFO0FBQzNFLGlDQUF5QztBQUN6QyxtQ0FBOEI7QUFDOUIseUJBQXlCO0FBQ3pCLG1DQUFtQztBQUNuQywwQ0FBMEM7QUFFMUMsZUFBZTtBQUNmLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFBO0FBRXJCLHlCQUF5QjtBQUN6QixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUMzQix3QkFBYyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzVELENBQUMsQ0FBQyxDQUFBO0FBRUYscUVBQXFFO0FBQ3JFLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3hCLHdCQUFjLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsWUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3RGLElBQUk7WUFDQSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzFDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUiw0QkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQzFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7U0FDeEI7SUFDTCxDQUFDLENBQUMs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