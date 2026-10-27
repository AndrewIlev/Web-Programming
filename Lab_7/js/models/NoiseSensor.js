import { NoiseMeasurement } from "./NoiseMeasurement.js";

export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,
  warningMax: 70,
});

export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (![id, district, location].every(value => typeof value === "string" && value.trim())) {
      throw new Error("ID, район і адреса датчика мають бути непорожніми рядками.");
    }
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new Error("Рівень шуму має бути скінченним числом від 0 до 200 дБ.");
    }

    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    this.measurements = [];
  }

  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) {
      return "normal";
    }
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) {
      return "warning";
    }
    return "critical";
  }

  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new Error("Рівень шуму має бути скінченним числом від 0 до 200 дБ.");
    }

    this.addMeasurement(new NoiseMeasurement(value));
  }

  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement) || !measurement.isValid()) {
      throw new Error("Очікується коректний екземпляр NoiseMeasurement.");
    }
    if (!NoiseSensor.isValidNoiseLevel(measurement.value)) {
      throw new Error("Рівень вимірювання має бути числом від 0 до 200 дБ.");
    }

    this.measurements.push(measurement);
    this.noiseLevel = measurement.value;
  }

  // Перевірка залежить лише від числа, а не від стану конкретного датчика.
  static isValidNoiseLevel(value) {
    return Number.isFinite(value) && value >= 0 && value <= 200;
  }

  static fromObject(data) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Дані датчика мають бути об'єктом.");
    }

    const { id, district, location, noiseLevel } = data;
    if (![id, district, location].every(value => typeof value === "string" && value.trim())) {
      throw new Error("Для датчика потрібні непорожні ID, район і адреса.");
    }
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new Error("Рівень шуму має бути скінченним числом від 0 до 200 дБ.");
    }

    return new NoiseSensor(id, district, location, noiseLevel);
  }
}
