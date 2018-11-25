# Home-Assistant configuration

## setup MQTT binary sensors

In Home-Assistant, you can define the mqtt events fired by ``gigaset-elements-proxy`` as [MQTT binary sensors](https://www.home-assistant.io/components/binary_sensor.mqtt/)

in ``configuration.yaml``, example for a sensor

```yaml
binary_sensor:
  - platform: mqtt
    state_topic: gigaset/garage
    name: Garage door
    device_class: garage_door
    payload_on: 'true'
    payload_off: 'false'
```

example for the basestation alarm mode

```yaml
sensor:
  - platform: mqtt
    state_topic: "gigaset/YOURBASENAME"
    name: "Gigaset Alarm Mode"
```

create a binary sensor from the alarm mode

```yaml
binary_sensor:
  - platform: template
    sensors:
      gigaset_alarm_mode_enabled: 
        value_template: >-
          {{ is_state('sensor.gigaset_alarm_mode', 'night') 
              or is_state('sensor.gigaset_alarm_mode', 'away')
              or is_state('sensor.gigaset_alarm_mode', 'custom') }}
```

## force the sensors update when home-assistant starts

Thanks to [user @h4nc](https://github.com/h4nc) suggestion, you can force the sensor update in ``gigaset-elements-proxy`` when ``home-assistant`` starts so that it has an accurate view of the sensors that have a state (ie. closed/open/tilt, home/away).

``gigaset-elements-proxy`` first get the sensor actual states and then send them to mqtt with the same syntax as if they where triggers by a real event.

in ``configuration.yaml``

```yaml
rest_command:
  gigaset_element_proxy_force_refresh:
    url: 'http://myserver:3000/force-refresh'
```

in ``automations.yaml``

```yaml
- id: 'gigaset_refresh_when_started'
  alias: gigaset - refresh sensor states after restart
  trigger:
    - event: start
      platform: homeassistant
  action:
    - delay: 00:00:10
    - service: rest_command.gigaset_element_proxy_force_refresh
```
