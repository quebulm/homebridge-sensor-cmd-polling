# homebridge-sensor-cmd-polling

[![MIT license](https://badgen.net/badge/license/MIT/red)](https://github.com/quebulm/homebridge-sensor-cmd-polling/blob/master/LICENSE)  

✅ **This is a fork of [apexad/homebridge-sensor-cmd](https://github.com/apexad/homebridge-sensor-cmd)**  
➡️ **Extended with configurable automatic polling support**

---

## What is this?

Originally, [homebridge-sensor-cmd](https://github.com/apexad/homebridge-sensor-cmd) was a **minimalistic Homebridge plugin** (about 50 lines of code) to create a Contact/Motion/Occupancy Sensor based on the output of a shell command (returning `1` or `0`).

This fork keeps all original functionality but **adds automatic polling**.  
Now, you can define a `pollingInterval` in the config so the plugin updates the sensor state automatically without waiting for HomeKit GET requests.

---

## New Feature: Automatic Polling

With this fork you can now add:

```json
"pollingInterval": 30
```

This will poll the command every **30 seconds** and update the sensor state automatically in HomeKit.

If you set `pollingInterval` to `0` or omit it, the behavior is identical to the original plugin (only updates on GET requests).

---

## Configuration

The easiest way to use this plugin is via [homebridge-config-ui-x](https://www.npmjs.com/package/homebridge-config-ui-x).

Add this to the `accessories` section of Homebridge's `config.json` after installing the plugin:

```json
{
  "accessory": "SensorCmd",
  "name": "<name of the sensor>",
  "type": "<sensor type: contact/motion/occupancy - default is contact>",
  "command": "<command-line/shell command to execute>",
  "pollingInterval": 30
}
```

---

## Original Author

- Original minimal version: [Alex 'apexad' Martin](https://github.com/apexad/homebridge-sensor-cmd)

## Fork Maintainer

- Fork with polling support: [Quentin Ulmer](https://github.com/quebulm/homebridge-sensor-cmd-polling)

---

## Installation

```bash
npm install -g homebridge-sensor-cmd-polling
```

---

## License

MIT same as the original.
