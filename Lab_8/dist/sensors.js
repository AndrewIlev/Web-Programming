const API_URL = "https://6ae05f5bbe3bc8fead96fb9c.mockapi.io/api/v1/sensors";
function showMessage(text) {
    const container = document.querySelector("#sensors-ts");
    if (!container) {
        return;
    }
    const message = document.createElement("p");
    message.className = "sensors__message";
    message.textContent = text;
    container.replaceChildren(message);
}
function renderSensors(sensors) {
    const container = document.querySelector("#sensors-ts");
    if (!container) {
        return;
    }
    container.replaceChildren();
    if (sensors.length === 0) {
        showMessage("Сенсорів поки немає.");
        return;
    }
    sensors.forEach((sensor) => {
        const card = document.createElement("article");
        card.classList.add("sensor-card", `sensor-card--${sensor.status}`);
        const title = document.createElement("h3");
        title.textContent = sensor.name;
        const district = document.createElement("p");
        district.textContent = `Район: ${sensor.district}`;
        const noiseLevel = document.createElement("p");
        noiseLevel.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;
        const status = document.createElement("p");
        status.textContent = `Статус: ${sensor.status}`;
        card.append(title, district, noiseLevel, status);
        container.append(card);
    });
}
async function loadSensors() {
    showMessage("Завантаження даних…");
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Не вдалося завантажити сенсори: ${response.status}`);
        }
        const sensors = await response.json();
        if (!Array.isArray(sensors)) {
            throw new Error("Відповідь API має бути масивом сенсорів.");
        }
        renderSensors(sensors);
    }
    catch (error) {
        console.error("Помилка:", error);
        showMessage("Не вдалося завантажити дані.");
    }
}
loadSensors();
export {};
