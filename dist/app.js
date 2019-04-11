#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const gigaset_1 = require("./gigaset");
const mqtt_1 = require("./mqtt");
const web_server_1 = require("./web-server");
require('console-stamp')(console, { colors: { stamp: 'grey', label: 'blue' } });
require('source-map-support').install();
process.on('unhandledRejection', console.log);
// gigaset-element-proxy current version
const VERSION = 'v2.0.0';
// gigaset-element-proxy is starting
console.info(`gigaset-element-provy ${VERSION} starting`);
// authorize on gigaset API
gigaset_1.authorize(() => utils_1.eventer.emit(utils_1.eventer.AUTHORIZED));
// once authorized
utils_1.eventer.once(utils_1.eventer.AUTHORIZED, () => {
    // start the local proxy
    setImmediate(web_server_1.startWebserver);
    // publish the actual gigaset states
    setImmediate(mqtt_1.sendActualStates);
    // check peridically for new incoming gigaset events to publish
    setInterval(mqtt_1.checkEvents, utils_1.conf('check_events_interval') * 1000);
});
// reauthorize periodically
setTimeout(gigaset_1.authorize, utils_1.conf('auth_interval') * 60 * 1000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxtQ0FBd0M7QUFDeEMsdUNBQXNDO0FBQ3RDLGlDQUF1RDtBQUN2RCw2Q0FBOEM7QUFFOUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxFQUFDLENBQUMsQ0FBQTtBQUMzRSxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN2QyxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUU3Qyx3Q0FBd0M7QUFDeEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFBO0FBRXhCLG9DQUFvQztBQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixPQUFPLFdBQVcsQ0FBQyxDQUFBO0FBRXpELDJCQUEyQjtBQUMzQixtQkFBUyxDQUFFLEdBQUcsRUFBRSxDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsZUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFFLENBQUE7QUFFbkQsa0JBQWtCO0FBQ2xCLGVBQU8sQ0FBQyxJQUFJLENBQUMsZUFBTyxDQUFDLFVBQVUsRUFBRSxHQUFFLEVBQUU7SUFFcEMsd0JBQXdCO0lBQ3hCLFlBQVksQ0FBQywyQkFBYyxDQUFDLENBQUE7SUFFNUIsb0NBQW9DO0lBQ3BDLFlBQVksQ0FBQyx1QkFBZ0IsQ0FBQyxDQUFBO0lBRTlCLCtEQUErRDtJQUMvRCxXQUFXLENBQUMsa0JBQVcsRUFBRSxZQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtBQUMvRCxDQUFDLENBQUMsQ0FBQTtBQUVGLDJCQUEyQjtBQUMzQixVQUFVLENBQUMsbUJBQVMsRUFBRSxZQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBIn0=