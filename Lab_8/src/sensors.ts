export {};

interface Sensor {
  id: string;
  name: string;
  district: string;
  noiseLevel: number;
  status: "active" | "inactive";
}

const API_URL: string = "https://6ae05f5bbe3bc8fead96fb9c.mockapi.io/api/v1/sensors";

function showMessage(text: string): void {
  const container: HTMLDivElement | null =
    document.querySelector<HTMLDivElement>("#sensors-ts");
  if (!container) {
    return;
  }

  const message: HTMLParagraphElement = document.createElement("p");
  message.className = "sensors__message";
  message.textContent = text;
  container.replaceChildren(message);
}

function renderSensors(sensors: Sensor[]): void {
  const container: HTMLDivElement | null =
    document.querySelector<HTMLDivElement>("#sensors-ts");
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (sensors.length === 0) {
    showMessage("Сенсорів поки немає.");
    return;
  }

  sensors.forEach((sensor: Sensor): void => {
    const card: HTMLElement = document.createElement("article");
    card.classList.add("sensor-card", `sensor-card--${sensor.status}`);

    const title: HTMLHeadingElement = document.createElement("h3");
    title.textContent = sensor.name;

    const district: HTMLParagraphElement = document.createElement("p");
    district.textContent = `Район: ${sensor.district}`;

    const noiseLevel: HTMLParagraphElement = document.createElement("p");
    noiseLevel.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;

    const status: HTMLParagraphElement = document.createElement("p");
    status.textContent = `Статус: ${sensor.status}`;

    card.append(title, district, noiseLevel, status);
    container.append(card);
  });
}

async function loadSensors(): Promise<void> {
  showMessage("Завантаження даних…");

  try {
    const response: Response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Не вдалося завантажити сенсори: ${response.status}`);
    }

    const sensors: Sensor[] = await response.json();
    if (!Array.isArray(sensors)) {
      throw new Error("Відповідь API має бути масивом сенсорів.");
    }

    renderSensors(sensors);
  } catch (error: unknown) {
    console.error("Помилка:", error);
    showMessage("Не вдалося завантажити дані.");
  }
}

loadSensors();
