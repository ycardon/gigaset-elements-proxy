import { conf, Cache } from './utils'
import request = require('request')


// gigaset URLs
// prettier-ignore
export enum GIGASET_URL {
    LOGIN =   'https://im.gigaset-elements.de/identity/api/v1/user/login',
    BASE =    'https://api.gigaset-elements.de',
    AUTH =    'https://api.gigaset-elements.de/api/v1/auth/openid/begin?op=gigaset',
    EVENTS =  'https://api.gigaset-elements.de/api/v2/me/events?from_ts=',
    CAMERA =  'https://api.gigaset-elements.de/api/v1/me/cameras/{id}/liveview/start',
    SENSORS = 'https://api.gigaset-elements.de/api/v1/me/basestations'
}

// a request caching wrapper
class RequestCachingWrapper {
    private cache = new Cache()
    constructor(readonly request: any) {}
    get(uri: string): request.Request {
        return this.request.get(uri)
    }
    get(uri: string, cb: request.RequestCallback): string {
        console.log('GET ' + uri)
        let cachedValue = this.cache.get(uri)
        if (cachedValue) return cachedValue
        else {
            let value = this.request.get(uri, cb)
            this.cache.set(uri, value)
            return value
        }
    }
    post(uri: string, options: request.CoreOptions, cb: request.RequestCallback) : request.Request {
        return this.request.post(uri, options, cb)
    }
}

// a request wrapper that retains cookies
export const gigasetRequest = new RequestCachingWrapper(request.defaults({ jar: true }))

/**
 * authorize on gigaset API
 */
export function authorize(callback = () => {}) {
    console.info('authorize on gigaset cloud api : starting')
    gigasetRequest.post(GIGASET_URL.LOGIN, { form: { email: conf('email'), password: conf('password') } }, () => {
        gigasetRequest.get(GIGASET_URL.AUTH, () => {
            console.info('authorize on gigaset cloud api : done')
            callback()
        })
    })
}

/**
 * log and try to recover from an unexpected gigaset response (ie. re-authorize)
 *
 * @remarks the gigaset connection tokens are sometimes reset on gigaset side at unexpectable time
 */
export function handleGigasetError(functionName: string, error: object, body: string) {
    console.error(functionName + ' | unexpected error:', error)
    console.error(functionName + ' | gigaset response:' + body)
    authorize()
}
