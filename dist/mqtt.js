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
mqttClient.on('connect', () => {
    console.info('mqtt connected');
});
/**
 * check new gigaset events
 */
function checkEvents() {
    // fetching new events
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.EVENTS + last_ts, (_, __, body) => {
        try {
            JSON.parse(body)
                .events.reverse() // treat the oldest events first
                .map((ev) => {
                //
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
                // only for sensors that have a status
                if (s.position_status != null) {
                    // publish status
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXF0dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tcXR0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQThCO0FBQzlCLHVDQUEyRTtBQUMzRSxpREFBbUQ7QUFDbkQsNkJBQTZCO0FBRTdCLGlCQUFpQjtBQUNqQixJQUFZLElBR1g7QUFIRCxXQUFZLElBQUk7SUFDWiwwQkFBa0IsQ0FBQTtJQUNsQix5Q0FBaUMsQ0FBQTtBQUNyQyxDQUFDLEVBSFcsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBR2Y7QUFFRCx3RUFBd0U7QUFDeEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUE7QUFFaEQscUNBQXFDO0FBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUV4Qix3RUFBd0U7QUFDeEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsWUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7QUFDdkUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0lBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUNsQyxDQUFDLENBQUMsQ0FBQTtBQUVGOztHQUVHO0FBQ0gsU0FBZ0IsV0FBVztJQUN2QixzQkFBc0I7SUFDdEIsd0JBQWMsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxNQUFNLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUM3RCxJQUFJO1lBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7aUJBQ1gsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLGdDQUFnQztpQkFDakQsR0FBRyxDQUFDLENBQUMsRUFBNkIsRUFBRSxFQUFFO2dCQUNuQyxFQUFFO2dCQUNGLGdCQUFnQjtnQkFDaEIs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