const elements = {
  generatedAt: document.querySelector('#generated-at'),
  temperature: document.querySelector('#temperature'),
  severity: document.querySelector('#weather-severity'),
  precipitation: document.querySelector('#precipitation'),
  snowRate: document.querySelector('#snow-rate'),
  windSpeed: document.querySelector('#wind-speed'),
  flightCount: document.querySelector('#flight-count'),
  deicingCount: document.querySelector('#deicing-count'),
  utilization: document.querySelector('#utilization'),
  avgDuration: document.querySelector('#avg-duration'),
  queueStatus: document.querySelector('#queue-status'),
  flightRows: document.querySelector('#flight-rows'),
  truckList: document.querySelector('#truck-list'),
  alertList: document.querySelector('#alert-list'),
  toast: document.querySelector('#toast'),
};

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderReport(report) {
  const { weather, flights, trucks, recommendations, alerts, summary } = report;
  elements.generatedAt.textContent = formatTime(report.generated_at);
  elements.temperature.textContent = weather.temperature_c;
  elements.severity.textContent = weather.severity.replaceAll('_', ' ');
  elements.precipitation.textContent = weather.precipitation_type.replaceAll('_', ' ');
  elements.snowRate.textContent = `${weather.snow_rate_cm_hr} cm/hr`;
  elements.windSpeed.textContent = `${weather.wind_speed_kts} kts wind`;
  elements.flightCount.textContent = summary['Total Monitored Flights'];
  elements.deicingCount.textContent = summary['Deicing Required Count'];
  elements.utilization.textContent = summary['Equipment Utilization'];
  elements.avgDuration.textContent = summary['Avg Predicted Deice Time'].replace(' mins', 'm');
  elements.queueStatus.textContent = `${recommendations.length} units assigned`;

  elements.flightRows.innerHTML = flights
    .sort((a, b) => b.deice_priority_score - a.deice_priority_score)
    .map((flight) => `<tr>
      <td>${flight.flight_id} <small>${flight.aircraft_type}</small></td>
      <td>${formatTime(flight.scheduled_departure)}</td>
      <td>${flight.gate}</td>
      <td class="priority">${flight.deice_priority_score.toFixed(2)}</td>
      <td class="${flight.assigned_truck_id ? 'assigned' : 'unassigned'}">${flight.assigned_truck_id || 'Awaiting unit'}</td>
    </tr>`).join('');

  elements.truckList.innerHTML = trucks.map((truck) => `<div class="truck-row">
    <div><p class="truck-name">${truck.truck_id} ${truck.is_available ? '· assigned' : '· busy'}</p><span class="truck-location">Gate ${truck.location_gate} · ${truck.assigned_flight_id || 'No flight'}</span></div>
    <span class="capacity ${truck.fluid_capacity_pct < 30 ? 'low' : ''}">${truck.fluid_capacity_pct}%</span>
  </div>`).join('');

  elements.alertList.innerHTML = alerts.length
    ? alerts.map((alert) => `<div class="alert-item">${alert}</div>`).join('')
    : '<div class="alert-item no-alerts">No active operational alerts.</div>';
}

async function loadOperations(showToast = false) {
  elements.queueStatus.textContent = 'Updating';
  try {
    const response = await fetch('/operations', { cache: 'no-store' });
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

document.querySelector('#refresh-button').addEventListener('click', () => loadOperations(true));
loadOperations();
setInterval(loadOperations, 60000);
