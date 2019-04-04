# gigaset-elements-proxy

Is a very simple gateway to [gigaset-elements](https://www.gigaset.com/fr_fr/cms/objets-connectes-apercu.html) API:

- periodic re-authentication
- local proxy to the gigaset-elements APIs
- gigaset-elements events are periodically fetched and pushed to a MQTT broker

As gigaset-elements does not provide local network APIs, I use it to access my equipement from https://home-assistant.io

[![Known Vulnerabilities](https://snyk.io/test/github/ycardon/gigaset-elements-proxy/badge.svg)](https://snyk.io/test/github/ycardon/gigaset-elements-proxy)

## Raw Gigaset APIs

These are the API that are published on Gigaset Cloud, `gigaset-elements-proxy` only re-expose them locally without authentication.
Note that if you're reading this page on github, theses links does not work: you have to install the project.

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

These extra APIs are based on raw Gigaset APIs and apply light treatment in order to make them easier to use in a 3rd party application.
Note that if you're reading this page on github, theses links does not work: you have to install the project.

- [live camera (redirect to a cloud-based RTSP stream)](/live): you have to set the camera id in the configuration file

- [live camera (local MJPEG stream)](/live-local): you have set your camera local infos in the configuration file

- [sensors status](/sensors): online/offline and open/close/tilt status of the sensors and equipements

- [intrusion settings](/intrusion_settings): selected mode of the alarm system

- [force refresh](/force-refresh): send the actual status of the sensors and the alarm mode as mqtt events

## MQTT events

- pushes event to queue `gigaset/<sensor_friendly_name>` with `true` or `false` payload
- motions events (movement detector and camera) automatically generate a delayed `false` event

## Installation

`npm` package is required.

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

Have a look on the `examples` directory for instructions on creating a service or configure the sensors inside home-assistant

You can get extra help on this [home-assistant community topic](https://community.home-assistant.io/t/help-needed-with-gigaset-elements/28201) or in the [issue section](https://github.com/ycardon/gigaset-elements-proxy/issues?utf8=✓&q=is%3Aissue)

You can also check https://github.com/lorenwest/node-config/wiki/Configuration-Files

## Restrictions

- only read events and states from the Gigaset Cloud API, no writes (eg. cannot change the status of the alarm system)
- track `ds02` (door sensors) `ws02`(window sensors) and `yc01` / `ps02`(movement and camera movement sensors) event types
- since v1.4, track `sp01` (siren command event)
- since v1.5, track `sd01` (smoke detector event)

## Improvements

### v1.3.2 Halloween (1 november 2018)

- when the server starts, send the actual status of the sensors and the alarm mode
- added the `/force-refresh` API to send again the actual status of the sensors and the alarm mode
- added `examples` directory
- added `ws02` window sensors type
- added `/intrusion_settings` API to monitor selected alarm mode
- added handling of basestation events (selected alarm mode)
- added more options to configue MQTT broker connections
- fixed CVE in dependency
- logging server version

### v1.3.5 Armistice (11 november 2018)

- logging mqtt connection errors
- basestation event now returns the mode of the alarm mode instead of true for home

### v1.4.6 Happy new year (24 february 2019)

- fire an mqtt event when an alarm is trigered (true) or acknowledged (false)
- better handling of parsing errors when gigaset API returns unexpected message (try to re-authorize)
- added sensor type in the /sensors API

### v1.5.0 Spring (4 april 2019)

- added `sd01` smoke detector sensors

## credits

- Strongly inspired by the Python command line version that can be find under https://github.com/dynasticorpheus/gigaset-elements (thank you !!)
- Security audits
    - https://www.iot-tests.org/2017/01/testing-gigaset-elements-camera/
    - https://team-sik.org/sik-2016-044/
    - https://team-sik.org/sik-2016-045/
    - https://team-sik.org/sik-2016-046/
    - https://team-sik.org/sik-2016-047/
    - https://team-sik.org/sik-2016-048/
- Thank you to https://github.com/h4nc, https://github.com/dotvav and https://github.com/sracing for their comments and suggestions
