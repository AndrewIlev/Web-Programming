import { NoiseSensor } from "./NoiseSensor.js";

const LOW_BATTERY_LIMIT = 20;

export class MobileNoiseSensor extends NoiseSensor {
  constructor(id, district, location, noiseLevel, batteryLevel) {
    super(id, district, location, noiseLevel);

    if (!Number.isFinite(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
      throw new Error("Рівень заряду має бути числом від 0 до 100 відсотків.");
    }

    this.batteryLevel = batteryLevel;
  }

  needsCharging() {
    return this.batteryLevel < LOW_BATTERY_LIMIT;
  }
}
