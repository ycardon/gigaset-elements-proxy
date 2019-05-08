"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const gigaset_1 = require("./gigaset");
const event_mapper_1 = require("./event-mapper");
const mqtt = require("mqtt");
// MQTT constants
var MQTT;
(function (MQTT) {
    MQTT["TOPIC"] = "gigaset/";
    MQTT["TOPIC_BATTERY_SUFFIX"] = "_battery";
})(MQTT = exports.MQTT || (exports.MQTT = {}));
// each motion sensor / smoke detector test event gets an attached timer
const timers = new Map();
// timestamp of the last emited event
let last_ts = Date.now();
// an mqtt client, user configures connection in the configuration files
const mqttClient = mqtt.connect(utils_1.conf('mqtt_url'), utils_1.conf('mqtt_options'));
mqttClient.on('connect', () => console.info('mqtt connected'));
/**
 * check new gigaset events
 */
function checkEvents() {
    // fetching new events
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.EVENTS + last_ts, (_, __, body) => {
        try {
            // treat the oldest events first
            JSON.parse(body).events.reverse().map((ev) => {
                // publish event
                last_ts = parseInt(ev.ts) + 1;
                console.log('acquired event: ' + JSON.stringify(ev));
                try {
                    let [topic, value] = event_mapper_1.gigasetEventMapper(ev);
                    mqttClient.publish(topic, value); // TODO remove typecheck enforcement here
                    console.log('event sent as mqtt_topic: ' + topic + ', value: ' + value);
                }
                catch (e) {
                    console.log('  event dropped: ' + e);
                }
                // publish a delayed 'false' event after motion is detected
                if (ev.type == 'yc01.motion' || ev.type == 'movement')
                    publishDelayedEvent(MQTT.TOPIC + ev.o.friendly_name, 'false', utils_1.conf('off_event_delay') * 1000);
                // publish a delayed 'default' event after a smoke detector test
                if (ev.type == 'test' && ev.o.type == 'sd01')
                    publishDelayedEvent(MQTT.TOPIC + ev.o.friendly_name, 'default', utils_1.conf('off_event_delay_after_smoke_detector_test') * 1000);
            });
        }
        catch (e) {
            gigaset_1.handleGigasetError('check events', e, body);
        }
    });
}
exports.checkEvents = checkEvents;
/**
 * publishes a delayed event, reset the existing (ie. same topic) ones
 *
 * @param topic - the mqtt topic
 * @param value - the mqtt value
 * @param delay - delay in milliseconds
 */
function publishDelayedEvent(topic, value, delay) {
    // reset (delete) existing timer for motion sensor, if any
    let timer = timers.get(topic);
    if (timer !== undefined)
        clearTimeout(timer);
    // set a new timer
    timers.set(topic, setTimeout(() => {
        console.log('delayed event sent as mqtt_topic: ' + topic + ', value: ' + value);
        mqttClient.publish(topic, value);
    }, delay));
}
/**
 * send the actual states of the sensors and alarm mode
 */
function sendActualStates() {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            // actual status of sensors
            JSON.parse(body)[0].sensors.map((s) => {
                // only for sensors that have a status
                if (s.position_status) {
                    // publish status
                    console.log(`sending actual state: ${s.friendly_name} | ${s.position_status}`);
                    mqttClient.publish(`gigaset/${s.friendly_name}`, s.position_status == 'closed' ? 'false' : 'true');
                }
                // smoke detector status, sending 'default' value
                else if (s.type == 'sd01') {
                    console.log(`sending actual state: ${s.friendly_name} | default`);
                    mqttClient.publish(`gigaset/${s.friendly_name}`, 'default');
                }
            });
            // actual status of alarm mode
            let base = JSON.parse(body)[0];
            console.log(`sending actual alarm mode: ${base.friendly_name} | ${base.intrusion_settings.active_mode}`);
            mqttClient.publish(`gigaset/${base.friendly_name}`, base.intrusion_settings.active_mode);
        }
        catch (e) {
            gigaset_1.handleGigasetError('sensor actual status', e, body);
        }
    });
}
exports.sendActualStates = sendActualStates;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXF0dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tcXR0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQThCO0FBQzlCLHVDQUEyRTtBQUMzRSxpREFBbUQ7QUFDbkQsNkJBQTZCO0FBRTdCLGlCQUFpQjtBQUNqQixJQUFZLElBR1g7QUFIRCxXQUFZLElBQUk7SUFDWiwwQkFBa0IsQ0FBQTtJQUNsQix5Q0FBaUMsQ0FBQTtBQUNyQyxDQUFDLEVBSFcsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBR2Y7QUFFRCx3RUFBd0U7QUFDeEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUE7QUFFaEQscUNBQXFDO0FBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUV4Qix3RUFBd0U7QUFDeEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsWUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7QUFDdkUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7QUFFOUQ7O0dBRUc7QUFDSCxTQUFnQixXQUFXO0lBRXZCLHNCQUFzQjtJQUN0Qix3QkFBYyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFO1FBQzdELElBQUk7WUFFQSxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBNkIsRUFBRSxFQUFFO2dCQUVwRSxnQkFBZ0I7Z0JBQ2hCLE9BQU8sR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFD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