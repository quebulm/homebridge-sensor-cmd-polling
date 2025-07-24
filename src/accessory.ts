import {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    HAP,
    Logging,
    Service,
} from 'homebridge';
import { exec } from 'child_process';

let hap: HAP;

export = (api: API) => {
    hap = api.hap;
    api.registerAccessory('SensorCmd', SensorCmd);
};

class SensorCmd implements AccessoryPlugin {
    private readonly sensorService: Service;
    private readonly infoService: Service;
    private readonly pollingInterval: number;
    private pollingTimer?: NodeJS.Timeout;

    constructor(private readonly log: Logging, private readonly config: AccessoryConfig) {
        // Determine which sensor type to create
        switch (this.config.type) {
            case "motion":
                this.sensorService = new hap.Service.MotionSensor(this.config.name);
                break;
            case "occupancy":
                this.sensorService = new hap.Service.OccupancySensor(this.config.name);
                break;
            case "contact":
            default:
                this.sensorService = new hap.Service.ContactSensor(this.config.name);
        }

        // Register the on-demand GET handler
        const characteristic = this.getRelevantCharacteristic();
        characteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
            this.runCommand((err, value) => callback(null, err ? 0 : value));
        });

        // Accessory info
        this.infoService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'apexad')
            .setCharacteristic(hap.Characteristic.Model, 'sensor-cmd');

        // Polling interval (default 60s)
        this.pollingInterval = this.config.pollingInterval ? this.config.pollingInterval : 60;

        if (this.pollingInterval > 0) {
            this.log(`Starting automatic polling every ${this.pollingInterval}s`);
            this.startPolling();
        }
    }

    /** Get the correct characteristic based on sensor type */
    private getRelevantCharacteristic() {
        switch (this.config.type) {
            case "motion":
                return this.sensorService.getCharacteristic(hap.Characteristic.MotionDetected);
            case "occupancy":
                return this.sensorService.getCharacteristic(hap.Characteristic.OccupancyDetected);
            case "contact":
            default:
                return this.sensorService.getCharacteristic(hap.Characteristic.ContactSensorState);
        }
    }

    /** Run the configured command and return parsed result */
    private runCommand(callback: (err: boolean, value: number) => void) {
        exec(this.config.command, (err, stdout) => {
            if (err) {
                this.log(`Command failed: ${err.message}`);
                callback(true, 0);
                return;
            }

            let parsed = parseInt(stdout.trim(), 10);
            if (isNaN(parsed)) parsed = 0;
            callback(false, parsed);
        });
    }

    /** Start polling periodically */
    private startPolling() {
        const characteristic = this.getRelevantCharacteristic();

        const poll = () => {
            this.runCommand((err, value) => {
                if (!err) {
                    this.log(`Polled value: ${value}`);
                    characteristic.updateValue(value);
                } else {
                    this.log(`Polling error, keeping previous value`);
                }
            });
        };

        // Initial poll
        poll();

        // Set recurring interval
        this.pollingTimer = setInterval(poll, this.pollingInterval * 1000);
    }

    /** Clean up when accessory is unloaded */
    public shutdown() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = undefined;
        }
    }

    getServices(): Service[] {
        return [this.infoService, this.sensorService];
    }
}