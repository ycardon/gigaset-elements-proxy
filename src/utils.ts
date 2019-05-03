import events from 'events'
import config from 'config'

/**
 * an event emitter (ie. an event bus), used for synchronisation between modules
 */
class Eventer extends events.EventEmitter {
    AUTHORIZED = 'authorized'
}
export const eventer = new Eventer()

/**
 * returns user configuration variables
 *
 * @param key - the configuration key
 */
export const conf = (key: string): any => config.get(key)

/**
 * memory cache
 */
export class Cache {
    private cache = new Map<string, [string, number]>()
    get(key: string) {
        let pair = this.cache.get(key)
        if (pair) {
            let [value, time] = pair
            if (Date.now() > time) {
                console.log('cache hit: ' + key + ' = ' + value)
                return value
            } else {
                console.log('cache expired: ' + key)
            }
        } else {
            console.log('cache no entry:' + key)
            return undefined
        }
    }
    set(key: string, value: string, ttl: number = 1000) {
        this.cache.set(key, [value, Date.now() + ttl])
    }
}