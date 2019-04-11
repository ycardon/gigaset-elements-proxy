import events from 'events';
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
export const conf = (key:string):any => config.get(key)
