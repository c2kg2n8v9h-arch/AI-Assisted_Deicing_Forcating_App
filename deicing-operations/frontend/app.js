const elements = {
  generatedAt: document.querySelector('#generated-at'),
  stationName: document.querySelector('#station-name'),
  stationSelect: document.querySelector('#station-select'),
  temperature: document.querySelector('#temperature'),
  severity: document.querySelector('#weather-severity'),
  precipitation: document.querySelector('#precipitation'),
  snowRate: document.querySelector('#snow-rate'),
  windSpeed: document.querySelector('#wind-speed'),
  flightCount: document.querySelector('#flight-count'),
  deicingCount: document.querySelector('#deicing-count'),
  utilization: document.querySelector('#utilization'),
  avgDuration: document.querySelector('#avg-duration'),
  nextFlight: document.querySelector('#next-flight'),
  nextFlightDetail: document.querySelector('#next-flight-detail'),
  queueStatus: document.querySelector('#queue-status'),
  flightRows: document.querySelector('#flight-rows'),
  truckList: document.querySelector('#truck-list'),
  alertList: document.querySelector('#alert-list'),
  stationWeatherGrid: document.querySelector('#station-weather-grid'),
  toast: document.querySelector('#toast'),
};

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}

function renderReport(report) {
  const { weather, flights, trucks, recommendations, alerts, summary } = report;
  elements.generatedAt.textContent = formatTime(report.generated_at);
  elements.stationName.textContent = `${report.station.name} (${report.station.code})`;
  elements.temperature.textContent = weather.temperature_c;
  elements.severity.textContent = weather.severity.replaceAll('_', ' ');
  elements.precipitation.textContent = weather.precipitation_type.replaceAll('_', ' ');
  elements.snowRate.textContent = `${weather.snow_rate_cm_hr} cm/hr`;
  elements.windSpeed.textContent = `${weather.wind_speed_kts} kts wind`;
  elements.flightCount.textContent = summary['Total Monitored Flights'];
  elements.deicingCount.textContent = summary['Deicing Required Count'];
  elements.utilization.textContent = summary['Equipment Utilization'];
  elements.avgDuration.textContent = summary['Avg Predicted Deice Time'].replace(' mins', 'm');
  elements.nextFlight.textContent = formatTime(report.next_flight.scheduled_departure);
  elements.nextFlightDetail.textContent = report.next_flight.minutes_until_departure >= 0
    ? `${report.next_flight.flight_id} · ${report.next_flight.minutes_until_departure} min`
    : `${report.next_flight.flight_id} · departed`;
  elements.queueStatus.textContent = `${recommendations.length} recommendations pending review`;

  elements.flightRows.innerHTML = flights
    .sort((a, b) => b.deice_priority_score - a.deice_priority_score)
    .map((flight) => `<tr>
      <td>${escapeHTML(flight.flight_id)} <small>${escapeHTML(flight.aircraft_type)}</small></td>
      <td>${formatTime(flight.scheduled_departure)}</td>
      <td>${flight.spray_completion_time ? formatTime(flight.spray_completion_time) : 'Not forecast'}</td>
      <td class="${flight.minutes_until_departure >= 0 ? 'assigned' : 'unassigned'}">${flight.minutes_until_departure >= 0 ? `${flight.minutes_until_departure} min` : 'departed'}</td>
      <td class="priority">${flight.deice_priority_score.toFixed(2)}</td>
      <td class="${flight.assigned_truck_id ? 'assigned' : 'unassigned'}">${escapeHTML(
        flight.assigned_truck_id
          || (flight.recommended_truck_id
            ? `Recommend ${flight.recommended_truck_id} · pending approval`
            : 'No approved assignment')
      )}</td>
    </tr>`).join('');

  elements.truckList.innerHTML = trucks.map((truck) => `<div class="truck-row">
    <div><p class="truck-name">${escapeHTML(truck.truck_id)} ${truck.is_available ? '· available' : '· busy'}</p><span class="truck-location">Gate ${escapeHTML(truck.location_gate)} · ${escapeHTML(truck.assigned_flight_id || 'No approved assignment')}</span></div>
    <span class="capacity ${truck.fluid_capacity_pct < 30 ? 'low' : ''}">${truck.fluid_capacity_pct}%</span>
  </div>`).join('');

  elements.alertList.innerHTML = alerts.length
    ? alerts.map((alert) => `<div class="alert-item">${escapeHTML(alert)}</div>`).join('')
    : '<div class="alert-item no-alerts">No active operational alerts.</div>';
}

function renderStationWeather(stations) {
  elements.stationWeatherGrid.innerHTML = stations.map((station) => `<article class="station-weather-card">
    <div class="station-weather-heading"><strong>${escapeHTML(station.code)}</strong><span>${escapeHTML(station.severity.replaceAll('_', ' '))}</span></div>
    <h4>${escapeHTML(station.name)}</h4>
    <div class="station-temperature">${station.temperature_c}<sup>°C</sup></div>
    <p>${escapeHTML(station.precipitation_type.replaceAll('_', ' '))} · ${station.snow_rate_cm_hr} cm/hr snow · ${station.wind_speed_kts} kts wind</p>
  </article>`).join('');
}

async function loadOperations(showToast = false) {
  elements.queueStatus.textContent = 'Updating';
  try {
    const response = await fetch(`/operations?station=${elements.stationSelect.value}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    renderReport(await response.json());
    if (showToast) {
      elements.toast.textContent = 'Operations data refreshed';
      elements.toast.classList.add('visible');
      setTimeout(() => elements.toast.classList.remove('visible'), 2200);
    }
  } catch (error) {
    elements.queueStatus.textContent = 'Offline';
    elements.toast.textContent = 'Unable to load operations data';
    elements.toast.classList.add('visible');
    console.error(error);
  }
}

async function loadStations() {
  const [response, overviewResponse] = await Promise.all([
    fetch('/stations', { cache: 'no-store' }),
    fetch('/stations/overview', { cache: 'no-store' }),
  ]);
  if (!response.ok) throw new Error(`Stations API returned ${response.status}`);
  if (!overviewResponse.ok) throw new Error(`Station overview API returned ${overviewResponse.status}`);
  const stations = await response.json();
  renderStationWeather(await overviewResponse.json());
  elements.stationSelect.innerHTML = stations
    .map((station) => `<option value="${escapeHTML(station.code)}">${escapeHTML(station.code)} · ${escapeHTML(station.name)}</option>`)
    .join('');
  elements.stationSelect.value = 'DEN';
}

elements.stationSelect.addEventListener('change', () => loadOperations(true));
document.querySelector('#refresh-button').addEventListener('click', () => loadOperations(true));
loadStations().then(loadOperations).catch((error) => {
  elements.queueStatus.textContent = 'Offline';
  console.error(error);
});
setInterval(loadOperations, 60000);
