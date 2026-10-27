export function initActiveSensors(getSensors) {
  const sensorList = document.querySelector(".active-sensors .sensor-list");
  const districtFilter = document.querySelector("#active-district-filter");
  const criticalFilter = document.querySelector("#critical-filter");

  function createSensorCard(sensor) {
    const status = sensor.getStatus();
    const card = document.createElement("article");
    card.className = `sensor-card sensor-card--${status}`;

    const title = document.createElement("h3");
    title.textContent = sensor.id;

    const district = document.createElement("p");
    district.textContent = `Район: ${sensor.district}`;

    const location = document.createElement("p");
    location.textContent = `Локація: ${sensor.location}`;

    const noiseLevel = document.createElement("p");
    noiseLevel.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;

    const statusText = document.createElement("p");
    statusText.textContent = `Статус: ${status}`;

    card.append(title, district, location, noiseLevel, statusText);
    return card;
  }

  function renderSensors(sensorArray) {
    sensorList.replaceChildren();
    sensorArray.forEach(sensor => sensorList.append(createSensorCard(sensor)));
  }

  function applyFilters() {
    const district = districtFilter.value;
    const criticalOnly = criticalFilter.checked;
    const filteredSensors = getSensors().filter(sensor => {
      const status = sensor.getStatus();
      const matchesDistrict = district === "all" || sensor.district === district;
      const matchesStatus = !criticalOnly || status === "critical";
      return matchesDistrict && matchesStatus;
    });

    renderSensors(filteredSensors);
  }

  districtFilter.addEventListener("change", applyFilters);
  criticalFilter.addEventListener("change", applyFilters);
  applyFilters();

  return { applyFilters };
}
