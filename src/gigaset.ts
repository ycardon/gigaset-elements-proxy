import { eventer, conf } from './utils';
import request = require('request')

// a request wrapper that retains cookies
export const gigasetRequest = request.defaults({jar: true})

// gigaset URLs
export enum GIGASET_URL {
    LOGIN =   'https://im.gigaset-elements.de/identity/api/v1/user/login',
    BASE =    'https://api.gigaset-elements.de',
    AUTH =    'https://api.gigaset-elements.de/api/v1/auth/openid/begin?op=gigaset',
    EVENTS =  'https://api.gigaset-elements.de/api/v2/me/events?from_ts=',
    CAMERA =  'https://api.gigaset-elements.de/api/v1/me/cameras/{id}/liveview/start',
    SENSORS = 'https://api.gigaset-elements.de/api/v1/me/basestations'
}

/**
 * authorize every n minutes
 */
export function authorize(firstTime = true) {
	console.info('authorize on gigaset cloud api : starting')
	gigasetRequest.post(GIGASET_URL.LOGIN, {form: {email: conf('email'), password: conf('password')}}, () => {
		gigasetRequest.get(GIGASET_URL.AUTH, () => {
			console.info('authorize on gigaset cloud api : done')
			if (firstTime) eventer.emit(eventer.AUTHORIZED)
		})
	})
	if (firstTime) setTimeout(authorize, conf('auth_interval') * 60 * 1000)
}

/**
 * log and try to recover from an unexpected gigaset response (ie. re-authorize)
 * 
 * @remarks the gigaset connection tokens are sometimes reset on gigaset side at unexpectable time
 */
export function handleGigasetError(functionName: string, error: object, body: string){
	console.error(functionName + ' | unexpected error:', error)
	console.error(functionName + ' | gigaset response:' + body)
	authorize(false)
}
