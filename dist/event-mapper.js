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
        case 'isl01.bs01.intrusion_mode_loaded': // changed security mode
            return [topic, event.o.modeAfter];
        case 'battery_critical': // critical battery on sensor
            return [topic + mqtt_1.MQTT.TOPIC_BATTERY_SUFFIX, event.type];
    }
    // sensor events (based on sensor type)
    switch (event.o.type) {
        //
        case 'ds02': // door sensors
        case 'ws02': // window sensors
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
        default:
            // other events will be dropped (unless stated in the config)
            if (utils_1.conf('allow_unknown_events'))
                return [topic, event.type];
            else
                throw 'unhandled event type: ' + event.o.type;
    }
}
exports.gigasetEventMapper = gigasetEventMapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbWFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50LW1hcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE4QjtBQUM5QixpQ0FBNkI7QUFFN0I7Ozs7OztHQU1HO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsS0FBZ0M7SUFDL0QsSUFBSSxLQUFLLEdBQUcsV0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQTtJQUU5QywyQ0FBMkM7SUFDM0MsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ2hCLEtBQUssa0NBQWtDLEVBQUUsd0JBQXdCO1lBQzdELE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUVyQyxLQUFLLGtCQUFrQixFQUFFLDZCQUE2QjtZQUNsRCxPQUFPLENBQUMsS0FBSyxHQUFHLFdBQUksQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDN0Q7SUFFRCx1Q0FBdUM7SUFDdkMsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRTtRQUNsQixFQUFFO1FBQ0YsS0FBSyxNQUFNLENBQUMsQ0FBQyxlQUFlO1FBQzVCLEtBQUssTUFBTSxFQUFFLGlCQUFpQjtZQUMxQixJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksT0FBTztnQkFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFBOztnQkFDN0MsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUUvQixLQUFLLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQjtRQUM3QixLQUFLLE1BQU0sRUFBRSxxQkFBcUI7WUFDOUIsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUUxQixLQUFLLE1BQU0sRUFBRSx5RUFBeUU7WUFDbEYsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUk7Z0JBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTs7Z0JBQ3pDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFFaEMsS0FBSyxNQUFNLEVBQUUsa0JBQWtCO1lBQzNCLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxnQkFBZ0I7Z0JBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTtpQkFDdEQsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLE1BQU07Z0JBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtpQkFDaEQsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLGVBQWU7Z0JBQUUsTUFBTSxzQkFBc0IsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFBOztnQkFDNUUsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUVsQztZQUNJLDZEQUE2RDtZQUM3RCxJQUFJLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQztnQkFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTs7Z0JBQ3ZELE1BQU0sd0JBQXdCLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7S0FDekQ7QUFDTCxDQUFDO0FBdkNELGdEQXVDQyJ9