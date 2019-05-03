"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const config_1 = __importDefault(require("config"));
/**
 * an event emitter (ie. an event bus), used for synchronisation between modules
 */
class Eventer extends events_1.default.EventEmitter {
    constructor() {
        super(...arguments);
        this.AUTHORIZED = 'authorized';
    }
}
exports.eventer = new Eventer();
/**
 * returns user configuration variables
 *
 * @param key - the configuration key
 */
exports.conf = (key) => config_1.default.get(key);
/**
 * memory cache
 */
class Cache {
    constructor() {
        this.cache = new Map();
    }
    get(key) {
        let pair = this.cache.get(key);
        if (pair) {
            let [value, time] = pair;
            if (Date.now() > time) {
                console.log('cache hit: ' + key + ' = ' + value);
                return value;
            }
            else {
                console.log('cache expired: ' + key);
            }
        }
        else {
            console.log('cache no entry:' + key);
            return undefined;
        }
    }
    set(key, value, ttl = 1000) {
        this.cache.set(key, [value, Date.now() + ttl]);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBMkI7QUFDM0Isb0RBQTJCO0FBRTNCOztHQUVHO0FBQ0gsTUFBTSxPQUFRLFNBQVEsZ0JBQU0sQ0FBQyxZQUFZO0lBQXpDOztRQUNJLGVBQVUsR0FBRyxZQUFZLENBQUE7SUFDN0IsQ0FBQztDQUFBO0FBQ1ksUUFBQSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUVwQzs7OztHQUlHO0FBQ1UsUUFBQSxJQUFJLEdBQUcsQ0FBQyxHQUFXLEVBQU8sRUFBRSxDQUFDLGdCQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBRXpEOztHQUVHO0FBQ0gsTUFBYSxLQUFLO0lBQWxCO1FBQ1ksVUFBSyxHQUFHLElBQUksR0FBRyxFQUE0QixDQUFBO0lBbUJ2RCxDQUFDO0lBbEJHLEdBQUcsQ0FBQyxHQUFXO1FBQ1gsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDOUIsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtZQUN4QixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUU7Z0JBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUE7Z0JBQ2hELE9BQU8sS0FBSyxDQUFBO2FBQ2Y7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsQ0FBQTthQUN2QztTQUNKO2FBQU07WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxDQUFBO1lBQ3BDLE9BQU8sU0FBUyxDQUFBO1NBQ25CO0lBQ0wsQ0FBQztJQUNELEdBQUcsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFFLE1BQWMsSUFBSTtRQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDbEQsQ0FBQztDQUNKO0FBcEJELHNCQW9CQyJ9