#!/usr/bin/env node

import { eventer } from "./utils";
import { authorize } from "./gigaset";
import { checkEvents, sendActualStates } from "./mqtt";
import { startWebserver } from "./web-server";

require('console-stamp')(console, {colors: {stamp: 'grey', label: 'blue'}})

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

	// check for new incoming gigaset events to publish
	setImmediate(checkEvents)
})
