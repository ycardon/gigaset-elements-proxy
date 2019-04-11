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
mqttClient.on('connect', () => { console.info("mqtt connected"); });
/**
 * check new gigaset events
 */
function checkEvents() {
    // request new events, treat the oldest first
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.EVENTS + last_ts, (_, __, body) => {
        try {
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
                else if (ev.type == 'test' && ev.o.type == 'sd01')
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
        console.log('delayed event sent as mqtt_topic: ' + topic + ', value:' + value);
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
                if (s.position_status != null) { // only for sensors that have a status
                    console.log(`sending actual state: ${s.friendly_name} | ${s.position_status}`);
                    mqttClient.publish(`gigaset/${s.friendly_name}`, s.position_status == 'closed' ? 'false' : 'true');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXF0dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tcXR0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQStCO0FBQy9CLHVDQUE0RTtBQUM1RSxpREFBb0Q7QUFDcEQsNkJBQTZCO0FBRTdCLGlCQUFpQjtBQUNqQixJQUFZLElBR1g7QUFIRCxXQUFZLElBQUk7SUFDWiwwQkFBa0IsQ0FBQTtJQUNsQix5Q0FBaUMsQ0FBQTtBQUNyQyxDQUFDLEVBSFcsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBR2Y7QUFFRCx3RUFBd0U7QUFDeEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUE7QUFFaEQscUNBQXFDO0FBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUV4Qix3RUFBd0U7QUFDeEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsWUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7QUFDdkUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBLENBQUEsQ0FBQyxDQUFDLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxTQUFnQixXQUFXO0lBRXZCLDZDQUE2QztJQUM3Qyx3QkFBYyxDQUFDLEdBQUcsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFO1FBQzdELElBQUk7WUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUE0QixFQUFFLEVBQUU7Z0JBRXBFLGdCQUFnQjtnQkFDaEIsT0FBTyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENB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