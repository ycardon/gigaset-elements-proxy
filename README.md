# gigaset-server

Is a simple local proxy to gigaset-elements API, doing periodic re-authentication.

Events periodically fetched from gigaset-elements API are also pushed to a MQTT broker.

As gigaset-elements does not provide local network APIs, I use it to access my equipement from https://home-assistant.io. It gives access to:

## raw gigaset API

- [basestations](/api/v1/me/basestations)

- [events](/api/v2/me/events)
    - ?limit=
    - ?group=
    - ?from_ts= &to_ts=

- [cameras](/api/v1/me/cameras)
    - /[id]/liveview/start
    - /[id]/recording/[status|start|stop]

- [health](/api/v2/me/health)

- [notification settings](/api/v1/me/notifications/users/channels)

## convenience APIs

- [live camera stream](/live)

- [sensors status](/sensors)

## installation

```
npm install
vim config/default.yaml    
node app.js
```
You can also check https://github.com/lorenwest/node-config/wiki/Configuration-Files

## limitations and todos

- not many error checking :/

## launch a local MQTT and a test client

- mosca -v | pino
- node test_client.js