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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBNEI7QUFDNUIsb0RBQTJCO0FBRTNCOztHQUVHO0FBQ0gsTUFBTSxPQUFRLFNBQVEsZ0JBQU0sQ0FBQyxZQUFZO0lBQXpDOztRQUNRLGVBQVUsR0FBRyxZQUFZLENBQUE7SUFDakMsQ0FBQztDQUFBO0FBQ1ksUUFBQSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUVwQzs7OztHQUlHO0FBQ1UsUUFBQSxJQUFJLEdBQUcsQ0FBQyxHQUFVLEVBQU0sRUFBRSxDQUFDLGdCQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBIn0=