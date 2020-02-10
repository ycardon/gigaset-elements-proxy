import { conf } from './utils'
import { MQTT } from './mqtt'

/**
 * tell what mqtt topic and value a gigaset event should return
 *
 * @param event - a gigaset event
 * @returns the corresponding [topic, value] pair
 * @throws exceptions when the event has to be dropped
 */
export function gigasetEventMapper(event: gigasetEvents.IEventsItem) {
    let topic = MQTT.TOPIC + event.o.friendly_name

    // basestation events (based on event type)
    switch (event.type) {
        case 'isl01.configuration_changed.user.intrusion_mode':
        case 'isl01.bs01.intrusion_mode_loaded': // changed security mode
            return [MQTT.TOPIC + 'intrusion_mode', event.o.modeAfter]

        case 'battery_critical': // critical battery on sensor
            return [topic + MQTT.TOPIC_BATTERY_SUFFIX, event.type]
    }

    // sensor events (based on sensor type)
    switch (event.o.type) {

        case 'ds02': // door sensors
        case 'ws02': // window sensors
        case 'um01': // universal sensors
            if (event.type == 'close') return [topic, 'false']
            else return [topic, 'true']

        case 'ps02': // motion sensor
        case 'ycam': // motion from camera
            return [topic, 'true']

        case 'sp01': // intrusion detected (or acknowledged), siren must turn on (or turn off)
            if (event.type == 'on') return [topic, 'true']
            else return [topic, 'false']

        case 'sd01': // smoke detectors
            if (event.type == 'smoke_detected') return [topic, 'alarm']
            else if (event.type == 'test') return [topic, 'test']
            else if (event.type == 'end_sd01_test') throw 'ignored event type: ' + event.type
            else return [topic, 'default']

        default: // other events will be dropped (unless stated in the config)
            if (conf('allow_unknown_events')) return [topic, event.type]
            else throw 'unhandled event type: ' + event.o.type
    }
}
