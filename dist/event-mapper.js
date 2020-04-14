"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const mqtt_1 = require("./mqtt");
/**
 * tell what mqtt topic and value a gigaset event should return
 *
 * @param event - a gigaset event
 * @returns the corresponding [topic, value] pair
 * @throws exceptions when the event has to be dropped
 */
function gigasetEventMapper(event) {
    let topic = mqtt_1.MQTT.TOPIC + event.o.friendly_name;
    // basestation events (based on event type)
    switch (event.type) {
        case 'isl01.configuration_changed.user.intrusion_mode':
        case 'isl01.bs01.intrusion_mode_loaded': // changed security mode
            return [mqtt_1.MQTT.TOPIC + 'intrusion_mode', event.o.modeAfter];
        case 'isl01.bs01.intrusion_mode_loaded.fail':
            return [mqtt_1.MQTT.TOPIC + 'intrusion_mode_fail', event.o.modeAfter];
        case 'battery_critical': // critical battery on sensor
            return [topic + mqtt_1.MQTT.TOPIC_BATTERY_SUFFIX, event.type];
    }
    // sensor events (based on sensor type)
    switch (event.o.type) {
        case 'ds02': // door sensors
        case 'ws02': // window sensors
        case 'um01': // universal sensors
            if (event.type == 'close')
                return [topic, 'false'];
            else
                return [topic, 'true'];
        case 'ps02': // motion sensor
        case 'ycam': // motion from camera
            return [topic, 'true'];
        case 'sp01': // intrusion detected (or acknowledged), siren must turn on (or turn off)
            if (event.type == 'on')
                return [topic, 'true'];
            else
                return [topic, 'false'];
        case 'sd01': // smoke detectors
            if (event.type == 'smoke_detected')
                return [topic, 'alarm'];
            else if (event.type == 'test')
                return [topic, 'test'];
            else if (event.type == 'end_sd01_test')
                throw 'ignored event type: ' + event.type;
            else
                return [topic, 'default'];
        default: // other events will be dropped (unless stated in the config)
            if (utils_1.conf('allow_unknown_events'))
                return [topic, event.type];
            else
                throw 'unhandled event type: ' + event.o.type;
    }
}
exports.gigasetEventMapper = gigasetEventMapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbWFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50LW1hcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE4QjtBQUM5QixpQ0FBNkI7QUFFN0I7Ozs7OztHQU1HO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsS0FBZ0M7SUFDL0QsSUFBSSxLQUFLLEdBQUcsV0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQTtJQUU5QywyQ0FBMkM7SUFDM0MsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ2hCLEtBQUssaURBQWlELENBQUM7UUFDdkQsS0FBSyxrQ0FBa0MsRUFBRSx3QkFBd0I7WUFDN0QsT0FBTyxDQUFDLFdBQUksQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUU3RCxLQUFLLHVDQUF1QztZQUN4QyxPQUFPLENBQUMsV0FBSSxDQUFDLEtBQUssR0FBRyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBRWxFLEtBQUssa0JBQWtCLEVBQUUsNkJBQTZCO1lBQ2xELE9BQU8sQ0FBQyxLQUFLLEdBQUcsV0FBSSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUM3RDtJQUVELHVDQUF1QztJQUN2QyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO1FBRWxCLEtBQUssTUFBTSxDQUFDLENBQUMsZUFBZTtRQUM1QixLQUFLLE1BQU0sQ0FBQyxDQUFDLGlCQUFpQjtRQUM5QixLQUFLLE1BQU0sRUFBRSxvQkFBb0I7WUFDN0IsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLE9BQU87Z0JBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTs7Z0JBQzdDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFL0IsS0FBSyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0I7UUFDN0IsS0FBSyxNQUFNLEVBQUUscUJBQXFCO1lBQzlCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFMUIsS0FBSyxNQUFNLEVBQUUseUVBQXlFO1lBQ2xGLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7O2dCQUN6QyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRWhDLEtBQUssTUFBTSxFQUFFLGtCQUFrQjtZQUMzQixJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksZ0JBQWdCO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7aUJBQ3RELElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxNQUFNO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7aUJBQ2hELElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxlQUFlO2dCQUFFLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQTs7Z0JBQzVFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFFbEMsU0FBUyw2REFBNkQ7WUFDbEUsSUFBSSxZQUFJLENBQUMsc0JBQXNCLENBQUM7Z0JBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7O2dCQUN2RCxNQUFNLHdCQUF3QixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0tBQ3pEO0FBQ0wsQ0FBQztBQTNDRCxnREEyQ0MifQ==