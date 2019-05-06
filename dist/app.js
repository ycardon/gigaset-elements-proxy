#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const gigaset_1 = require("./gigaset");
const mqtt_1 = require("./mqtt");
const web_server_1 = require("./web-server");
const environment_1 = require("./environment/environment");
require('console-stamp')(console, { colors: { stamp: 'grey', label: 'blue' } });
require('source-map-support').install();
process.on('unhandledRejection', console.log);
// gigaset-element-proxy current version
const VERSION = environment_1.environment.version;
// --- MAIN LOOP ---
// gigaset-element-proxy is starting
console.info('gigaset-element-provy ' + VERSION + ' is starting');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxtQ0FBdUM7QUFDdkMsdUNBQXFDO0FBQ3JDLGlDQUFzRDtBQUN0RCw2Q0FBNkM7QUFDN0MsMkRBQXdEO0FBRXhELE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDL0UsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDdkMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFFN0Msd0NBQXdDO0FBQ3hDLE1BQU0sT0FBTyxHQUFHLHlCQUFXLENBQUMsT0FBTyxDQUFBO0FBRW5DLG9CQUFvQjtBQUVwQixvQ0FBb0M7QUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxPQUFPLEdBQUcsY0FBYyxDQUFDLENBQUE7QUFFakUsMkJBQTJCO0FBQzNCLG1CQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxlQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtBQUVqRCxrQkFBa0I7QUFDbEIsZUFBTyxDQUFDLElBQUksQ0FBQyxlQUFPLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtJQUVsQyx3QkFBd0I7SUFDeEIsWUFBWSxDQUFDLDJCQUFjLENBQUMsQ0FBQTtJQUU1QixvQ0FBb0M7SUFDcEMsWUFBWSxDQUFDLHVCQUFnQixDQUFDLENBQUE7SUFFOUIsK0RBQStEO0lBQy9ELFdBQVcsQ0FBQyxrQkFBVyxFQUFFLFlBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0FBQ2xFLENBQUMsQ0FBQyxDQUFBO0FBRUYsMkJBQTJCO0FBQzNCLFVBQVUsQ0FBQyxtQkFBUyxFQUFFLFlBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUEifQ==