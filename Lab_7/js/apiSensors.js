// Замініть плейсхолдер на адресу свого проєкту MockAPI.
const API_URL = "https://6ae05f5bbe3bc8fead96fb9c.mockapi.io/api/v1/sensors";

async function loadSensors() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const sensors = await response.json();
  if (!Array.isArray(sensors)) {
    throw new Error("Відповідь API має бути масивом сенсорів.");
  }

  return sensors;
}

function showMessage(text) {
  const sensorsContainer = document.querySelector("#sensors-list");
  const message = document.createElement("p");
  message.className = "sensors__message";
  message.textContent = text;
  sensorsContainer.replaceChildren(message);
}

function renderSensors(sensors) {
  const sensorsContainer = document.querySelector("#sensors-list");
  sensorsContainer.replaceChildren();

  if (sensors.length === 0) {
    showMessage("Сенсорів поки немає.");
    return;
  }

  sensors.forEach(sensor => {
    const card = document.createElement("article");
    card.className = "sensor-card";
    card.classList.add(
      sensor.status === "active" ? "sensor-card--active" : "sensor-card--inactive"
    );

    const title = document.createElement("h3");
    title.textContent = sensor.name;

    const district = document.createElement("p");
    district.textContent = `Район: ${sensor.district}`;

    const noiseLevel = document.createElement("p");
    noiseLevel.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;

    const status = document.createElement("p");
    status.textContent = `Статус: ${sensor.status}`;

    card.append(title, district, noiseLevel, status);
    sensorsContainer.append(card);
  });
}

export async function initApiSensors() {
  if (API_URL.includes("YOUR_MOCKAPI_URL")) {
    console.warn("Вкажіть адресу MockAPI у змінній API_URL (js/apiSensors.js).");
    showMessage("Вкажіть адресу MockAPI у змінній API_URL (js/apiSensors.js).");
    return;
  }

  showMessage("Завантаження даних…");
  try {
    const sensors = await loadSensors();
    renderSensors(sensors);
  } catch (error) {
    console.error("Не вдалося завантажити сенсори:", error);
    showMessage("Не вдалося завантажити дані.");
  }
}
