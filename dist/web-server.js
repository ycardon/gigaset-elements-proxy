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
// set the route: sensors
app.get('/sensors', (_, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            res.send(JSON.parse(body)[0].sensors.map((s) => {
                return { name: s.friendly_name, type: s.type, status: s.status, position_status: s.position_status };
            }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLXNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWItc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQTRFO0FBQzVFLGlDQUEwQztBQUMxQyxtQ0FBK0I7QUFDL0IseUJBQXlCO0FBQ3pCLG1DQUFtQztBQUNuQywwQ0FBMEM7QUFFMUMsZUFBZTtBQUNmLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFBO0FBRXJCLHlCQUF5QjtBQUN6QixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUMzQix3QkFBYyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzVELENBQUMsQ0FBQyxDQUFBO0FBRUYscUVBQXFFO0FBQ3JFLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3hCLHdCQUFjLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsWUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3RGLElBQUk7WUFDQSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzFDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUiw0QkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQzFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7U0FDeEI7SUFDTCxDQUFDLENBQUMs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