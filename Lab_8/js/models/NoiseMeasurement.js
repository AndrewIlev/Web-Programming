export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt;
  }

  isValid() {
    return (
      Number.isFinite(this.value) &&
      this.measuredAt instanceof Date &&
      Number.isFinite(this.measuredAt.getTime())
    );
  }

  toString() {
    const time = this.measuredAt.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${this.value} dB (${time})`;
  }
}
