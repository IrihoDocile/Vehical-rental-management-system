const API = 'http://localhost:5000/api';
const money = value => Number(value).toLocaleString('en-US') + ' RWF';

async function request(path, options = {}) {
  const response = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function loadVehicles() {
  const container = document.getElementById('vehicles');
  const select = document.getElementById('vehicleSelect');
  try {
    const vehicles = await request('/vehicles');
    const available = vehicles.filter(v => v.available);
    container.innerHTML = available.length ? available.map(v => `
      <article class="vehicle-card">
        <img src="${escapeHtml(v.image_url || '')}" alt="${escapeHtml(v.name)}" onerror="this.src='https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900'">
        <div class="vehicle-info"><h3>${escapeHtml(v.name)}</h3><p class="muted">${escapeHtml(v.type)}</p>
        <p class="price">${money(v.price_per_day)} <small>/ day</small></p>
        <button class="primary" onclick="chooseVehicle(${v.id})">Book this vehicle</button></div>
      </article>`).join('') : '<p>No vehicles are currently available.</p>';
    select.innerHTML = '<option value="">Select a vehicle</option>' + available.map(v =>
      `<option value="${v.id}">${escapeHtml(v.name)} — ${money(v.price_per_day)}/day</option>`).join('');
  } catch (error) { container.textContent = error.message; }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function chooseVehicle(id) {
  document.getElementById('vehicleSelect').value = id;
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('bookingForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  const message = document.getElementById('bookingMessage');
  try {
    const result = await request('/bookings', { method: 'POST', body: JSON.stringify(form) });
    message.textContent = result.message;
    event.target.reset();
    loadBookings();
  } catch (error) { message.textContent = error.message; }
});

document.getElementById('vehicleForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  const message = document.getElementById('vehicleMessage');
  try {
    const result = await request('/vehicles', { method: 'POST', body: JSON.stringify(form) });
    message.textContent = result.message;
    event.target.reset();
    loadVehicles();
  } catch (error) { message.textContent = error.message; }
});

async function loadBookings() {
  const rows = document.getElementById('bookingRows');
  try {
    const bookings = await request('/bookings');
    rows.innerHTML = bookings.length ? bookings.map(b => `
      <tr><td>${escapeHtml(b.customer_name)}<br><span class="muted">${escapeHtml(b.customer_email)}</span></td>
      <td>${escapeHtml(b.vehicle_name)}</td><td>${escapeHtml(b.start_date)}<br>${escapeHtml(b.end_date)}</td>
      <td>${escapeHtml(b.status)}</td><td>
      <button onclick="setStatus(${b.id},'Approved')">Approve</button>
      <button onclick="setStatus(${b.id},'Rejected')">Reject</button>
      <button onclick="setStatus(${b.id},'Completed')">Complete</button></td></tr>`).join('') :
      '<tr><td colspan="5">No bookings yet.</td></tr>';
  } catch (error) { rows.innerHTML = `<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`; }
}

async function setStatus(id, status) {
  try {
    await request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    loadBookings();
  } catch (error) { alert(error.message); }
}

loadVehicles();
loadBookings();
