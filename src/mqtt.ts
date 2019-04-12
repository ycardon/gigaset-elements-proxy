import { conf } from './utils'
import { gigasetRequest, GIGASET_URL, handleGigasetError } from './gigaset'
import { gigasetEventMapper } from './event-mapper'
import mqtt = require('mqtt')

// MQTT constants
export enum MQTT {
    TOPIC = 'gigaset/',
    TOPIC_BATTERY_SUFFIX = '_battery'
}

// each motion sensor / smoke detector test event gets an attached timer
const timers = new Map<string, NodeJS.Timeout>()

// timestamp of the last emited event
let last_ts = Date.now()

// an mqtt client, user configures connection in the configuration files
const mqttClient = mqtt.connect(conf('mqtt_url'), conf('mqtt_options'))
mqttClient.on('connect', () => {
    console.info('mqtt connected')
})

/**
 * check new gigaset events
 */
export function checkEvents() {
    // fetching new events
    gigasetRequest.get(GIGASET_URL.EVENTS + last_ts, (_, __, body) => {
        try {
            JSON.parse(body)
                .events.reverse() // treat the oldest events first
                .map((ev: gigasetEvents.IEventsItem) => {
                    //
                    // publish event
                    last_ts = parseInt(ev.ts) + 1
                    console.log('acquired event: ' + JSON.stringify(ev))
                    try {
                        let [topic, value] = gigasetEventMapper(ev)
                        mqttClient.publish(topic!, value!) // TODO remove typecheck enforcement here
                        console.log('event sent as mqtt_topic: ' + topic + ', value: ' + value)
                    } catch (e) {
                        console.log('  event dropped: ' + e)
                    }

                    // publish a delayed 'false' event after motion is detected
                    if (ev.type == 'yc01.motion' || ev.type == 'movement')
                        publishDelayedEvent(MQTT.TOPIC + ev.o.friendly_name, 'false', conf('off_event_delay') * 1000)

                    // publish a delayed 'default' event after a smoke detector test
                    if (ev.type == 'test' && ev.o.type == 'sd01')
                        publishDelayedEvent(MQTT.TOPIC + ev.o.friendly_name, 'default', conf('off_event_delay_after_smoke_detector_test') * 1000)
                })
        } catch (e) {
            handleGigasetError('check events', e, body)
        }
    })
}

/**
 * publishes a delayed event, reset the existing (ie. same topic) ones
 *
 * @param topic - the mqtt topic
 * @param value - the mqtt value
 * @param delay - delay in milliseconds
 */
function publishDelayedEvent(topic: string, value: string, delay: number) {
    // reset (delete) existing timer for motion sensor, if any
    let timer = timers.get(topic)
    if (timer !== undefined) clearTimeout(timer)

    // set a new timer
    timers.set(
        topic,
        setTimeout(() => {
            console.log('delayed event sent as mqtt_topic: ' + topic + ', value:' + value)
            mqttClient.publish(topic, value)
        }, delay)
    )
}

/**
 * send the actual states of the sensors and alarm mode
 */
export function sendActualStates() {
    gigasetRequest.get(GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            // actual status of sensors
            JSON.parse(body)[0].sensors.map((s: gigasetBasestations.ISensorsItem) => {
                // only for sensors that have a status
                if (s.position_status != null) {
                    // publish status
                    console.log(`sending actual state: ${s.friendly_name} | ${s.position_status}`)
                    mqttClient.publish(`gigaset/${s.friendly_name}`, s.position_status == 'closed' ? 'false' : 'true')
                }
            })

            // actual status of alarm mode
            let base: gigasetBasestations.IRootObjectItem = JSON.parse(body)[0]
            console.log(`sending actual alarm mode: ${base.friendly_name} | ${base.intrusion_settings.active_mode}`)
            mqttClient.publish(`gigaset/${base.friendly_name}`, base.intrusion_settings.active_mode)
        } catch (e) {
            handleGigasetError('sensor actual status', e, body)
        }
    })
}
