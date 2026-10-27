import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { NoiseSensor } from "./models/NoiseSensor.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

const sensorsData = [
  {
    id: "NS-01",
    district: "Галицький",
    location: "просп. Свободи",
    noiseLevel: 58,
  },
  {
    id: "NS-02",
    district: "Франківський",
    location: "вул. Наукова",
    noiseLevel: 74,
  },
  {
    id: "NS-03",
    district: "Шевченківський",
    location: "просп. Чорновола",
    noiseLevel: 83,
  },
];

const STATUS_LABELS = Object.freeze({
  normal: "У межах норми",
  warning: "Підвищений рівень",
  critical: "Критичний рівень",
});

// Фабрика перевіряє поля і повертає коректні екземпляри датчиків.
const sensors = sensorsData.map(data => NoiseSensor.fromObject(data));
const system = new MonitoringSystem();
sensors.forEach(sensor => system.addSensor(sensor));

const sensorList = document.querySelector("#sensor-list");
const sensorCount = document.querySelector("#sensor-count");
const averageNoise = document.querySelector("#average-noise");
const criticalCount = document.querySelector("#critical-count");
const searchInput = document.querySelector("#sensor-search");
const districtFilter = document.querySelector("#district-filter");
const filterMessage = document.querySelector("#filter-message");

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderSensorCard(sensor) {
  const status = sensor.getStatus();
  const card = createElement("article", `monitor-card sensor-card ${status}`, "");
  const id = createElement("span", "label", `Датчик шуму · ${sensor.id}`);
  const district = createElement("h3", "", sensor.district);
  const location = createElement("p", "muted sensor-location", sensor.location);
  const noiseLevel = createElement("p", "decibel", "");
  const unit = createElement("span", "", "dB");
  noiseLevel.append(`${sensor.noiseLevel} `, unit);

  const statusBadge = createElement("span", `status status-${status}`, "");
  statusBadge.append(
    document.createElement("span"),
    document.createTextNode(STATUS_LABELS[status])
  );

  const latestMeasurement = sensor.measurements.at(-1);
  const measurementNote = createElement(
    "p",
    "reading-note",
    latestMeasurement
      ? `Останнє вимірювання: ${latestMeasurement.toString()}`
      : "Вимірювань ще немає."
  );

  card.append(id, district, location, noiseLevel, statusBadge, measurementNote);

  const form = createElement("form", "sensor-reading-form", "");
  form.dataset.sensorId = sensor.id;
  const label = createElement("label", "", "Нове вимірювання, dB");
  const input = document.createElement("input");
  input.type = "number";
  input.name = "noiseLevel";
  input.min = "0";
  input.max = "200";
  input.step = "any";
  input.required = true;
  input.setAttribute("aria-label", `Нове вимірювання для датчика ${sensor.id}`);
  label.append(input);

  const button = createElement("button", "", "Додати вимірювання");
  button.type = "submit";
  const errorMessage = createElement("p", "sensor-form-feedback", "");
  errorMessage.setAttribute("aria-live", "polite");
  form.append(label, button, errorMessage);
  card.append(form);

  return card;
}

function updateSummary() {
  const allSensors = system.getSensors();
  const average = system.getAverageNoiseLevel();

  sensorCount.textContent = `${allSensors.length}`;
  criticalCount.textContent = `${system.getCriticalSensors().length}`;
  averageNoise.textContent =
    average === null
      ? "—"
      : `${average.toLocaleString("uk-UA", { maximumFractionDigits: 2 })} dB`;
}

function renderSensors(visibleSensors) {
  sensorList.replaceChildren(...visibleSensors.map(renderSensorCard));
  updateSummary();
  filterMessage.textContent =
    visibleSensors.length === 0 ? "За заданими умовами датчиків не знайдено." : "";
}

function getVisibleSensors() {
  const district = districtFilter.value;
  const districtSensors = district
    ? system.getSensorsByDistrict(district)
    : system.getSensors();
  const id = searchInput.value.trim();

  if (!id) {
    return districtSensors;
  }

  const sensor = system.findSensorById(id);
  return sensor && districtSensors.includes(sensor) ? [sensor] : [];
}

function updateVisibleSensors() {
  renderSensors(getVisibleSensors());
}

for (const sensor of system.getSensors()) {
  const option = document.createElement("option");
  option.value = sensor.district;
  option.textContent = sensor.district;
  districtFilter.append(option);
}

sensorList.addEventListener("submit", event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.matches(".sensor-reading-form")) {
    return;
  }

  event.preventDefault();
  const sensor = system.findSensorById(form.dataset.sensorId);
  const errorMessage = form.querySelector(".sensor-form-feedback");
  const input = form.elements.namedItem("noiseLevel");

  try {
    if (!sensor) {
      throw new Error("Датчик не знайдено в системі.");
    }
    if (!NoiseSensor.isValidNoiseLevel(input.valueAsNumber)) {
      throw new Error("Введіть скінченне число від 0 до 200 dB.");
    }

    sensor.addMeasurement(new NoiseMeasurement(input.valueAsNumber));
    updateVisibleSensors();
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

searchInput.addEventListener("input", updateVisibleSensors);
districtFilter.addEventListener("change", updateVisibleSensors);

renderSensors(system.getSensors());

function runClassExperiments() {
  const sensorA = new NoiseSensor("TEST-01", "Тестовий", "вул. Перша", 58);
  const sensorB = new NoiseSensor("TEST-02", "Тестовий", "вул. Друга", 74);
  sensorA.updateNoiseLevel(40);

  console.groupCollapsed("Експерименти з класами та prototype");
  console.log("Зміна sensorA не змінила sensorB:", sensorB.noiseLevel); // очікується 74
  console.log("Метод спільний для екземплярів:", sensorA.getStatus === sensorB.getStatus); // очікується true
  console.log("noiseLevel — власна властивість:", Object.hasOwn(sensorA, "noiseLevel")); // очікується true
  console.log("getStatus — власна властивість:", Object.hasOwn(sensorA, "getStatus")); // очікується false

  const mobileSensor = new MobileNoiseSensor(
    "MOBILE-01",
    "Тестовий",
    "мобільна точка",
    48,
    15
  );
  console.log("Статус мобільного датчика:", mobileSensor.getStatus()); // очікується normal
  console.log("Мобільний датчик потребує заряджання:", mobileSensor.needsCharging()); // очікується true
  console.log("Мобільний датчик є NoiseSensor:", mobileSensor instanceof NoiseSensor); // очікується true
  console.groupEnd();
}

runClassExperiments();
