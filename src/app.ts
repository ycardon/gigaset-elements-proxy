#!/usr/bin/env node

import { eventer, conf } from "./utils";
import { authorize } from "./gigaset";
import { checkEvents, sendActualStates } from "./mqtt";
import { startWebserver } from "./web-server";

require('console-stamp')(console, {colors: {stamp: 'grey', label: 'blue'}})
require('source-map-support').install()
process.on('unhandledRejection', console.log)

const VERSION = 'v2.0.0'

// gigaset-element-proxy is starting
console.info(`gigaset-element-provy ${VERSION} starting`)

// authorize on gigaset API
authorize()

// once authorized
eventer.once(eventer.AUTHORIZED, ()=>{

	// start the local proxy
	setImmediate(startWebserver)

	// publish the actual gigaset states
	setImmediate(sendActualStates)

	// check peridically for new incoming gigaset events to publish
	setInterval(checkEvents, conf('check_events_interval') * 1000)
})
