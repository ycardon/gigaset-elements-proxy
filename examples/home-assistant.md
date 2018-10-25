# Home-Assistant configuration

In Home-Assistant, you can define the mqtt events fired by ``gigaset-elements-proxy`` as [MQTT binary sensors](https://www.home-assistant.io/components/binary_sensor.mqtt/)

```
binary_sensor:
  - platform: mqtt
    state_topic: gigaset/garage
    name: Garage door
    device_class: garage_door
    payload_on: 'true'
    payload_off: 'false'
```
