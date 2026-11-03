import { NoiseSensor } from "../models/NoiseSensor.js";

export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new Error("Можна додавати лише екземпляри NoiseSensor.");
    }
    if (this.sensors.some(item => item.id === sensor.id)) {
      throw new Error(`Датчик з ID ${sensor.id} вже існує.`);
    }

    this.sensors.push(sensor);
  }

  getSensors() {
    return [...this.sensors];
  }

  findSensorById(id) {
    // Якщо датчик відсутній, метод повертає null.
    return this.sensors.find(sensor => sensor.id === id) ?? null;
  }

  getSensorsByDistrict(district) {
    return this.sensors.filter(sensor => sensor.district === district);
  }

  getCriticalSensors() {
    return this.sensors.filter(sensor => sensor.getStatus() === "critical");
  }

  getAverageNoiseLevel() {
    // reduce стисло підсумовує значення всієї колекції.
    if (this.sensors.length === 0) {
      // Для порожньої системи середнього значення немає.
      return null;
    }

    const total = this.sensors.reduce((sum, sensor) => sum + sensor.noiseLevel, 0);
    return total / this.sensors.length;
  }
}
