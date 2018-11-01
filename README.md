# gigaset-elements-proxy

Is a very simple gateway to gigaset-elements API:

- periodic re-authentication
- local proxy to the gigaset-elements APIs
- gigaset-elements events are periodically fetched and pushed to a MQTT broker

As gigaset-elements does not provide local network APIs, I use it to access my equipement from https://home-assistant.io

[![Known Vulnerabilities](https://snyk.io/test/github/ycardon/gigaset-elements-proxy/badge.svg)](https://snyk.io/test/github/ycardon/gigaset-elements-proxy)

## Raw API

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

## Convenience APIs

- [live camera (redirect to a cloud-based RTSP stream)](/live): you have to set the camera id in the configuration file

- [live camera (local MJPEG stream)](/live-local): you have set your camera local infos in the configuration file

- [sensors status](/sensors): online/offline and open/close/tilt status of the sensors and equipements

- [intrusion stettings](/intrusion_settings): selected mode of the alarm system

- [force refresh](/force-refresh): send the actual status of the sensors and the alarm mode as mqtt events

## MQTT events

- pushes event to queue `gigaset/<sensor_friendly_name>` with `true` or `false` payload
- motions events (movement detector and camera) automatically generate a delayed `false` event

## installation

``npm`` package is required.

from git (recommended if you have to customize the application to your needs)

```
> git clone https://github.com/ycardon/gigaset-elements-proxy
> cd gigaset-elements-proxy
> npm install
> vim config/default.yaml    
> node app.js
```

from npm

```
install
> [sudo] npm install gigaset-elements-proxy -g

locate then edit config/default.yaml with
> npm list gigaset-elements-proxy

run
> ge-proxy
```

Have a look on the ``examples`` directory for instructions on creating a service or configure the sensors inside home-assistant

You can get extra help on this [home-assistant community topic](https://community.home-assistant.io/t/help-needed-with-gigaset-elements/28201) or in the [issue section](https://github.com/ycardon/gigaset-elements-proxy/issues?utf8=✓&q=is%3Aissue)

You can also check https://github.com/lorenwest/node-config/wiki/Configuration-Files

## Restrictions

- only read events and states from the Gigaset Cloud API, no writes (eg. cannot change the status of the alarm system)
- only track ``ds02`` (door sensors) ``ws02``(window sensors) and ``yc01`` / ``ps02``(movement and camera movement sensors) event types

## Improvements

### v1.3.1 Halloween (1 november 2018)

- when the server starts, send the actual status of the sensors and the alarm mode
- added the ``/force-refresh`` API to send again the actual status of the sensors and the alarm mode
- added ``examples`` directory
- added ``ws02`` window sensors type
- added ``/intrusion_settings`` API to monitor selected alarm mode
- added handling of basestation events (selected alarm mode)
- added more options to configue MQTT broker connections

## credits

- Strongly inspired by the Python command line version that can be find under https://github.com/dynasticorpheus/gigaset-elements (thank you !!)
- Security audits
    - https://www.iot-tests.org/2017/01/testing-gigaset-elements-camera/
    - https://team-sik.org/sik-2016-044/
    - https://team-sik.org/sik-2016-045/
    - https://team-sik.org/sik-2016-046/
    - https://team-sik.org/sik-2016-047/
    - https://team-sik.org/sik-2016-048/
- Thank you to https://github.com/h4nc for his comments and suggestions
