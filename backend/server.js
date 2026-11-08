const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'rental_user',
  password: process.env.DB_PASSWORD || 'rental_pass',
  database: process.env.DB_NAME || 'vehicle_rental',
  waitForConnections: true,
  connectionLimit: 10
};

let pool;
async function connectDatabase() {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1');
      console.log('Connected to MySQL');
      return;
    } catch (error) {
      console.log(`Waiting for MySQL (${attempt}/30): ${error.message}`);
      if (pool) await pool.end().catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Could not connect to MySQL');
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', service: 'Vehicle Rental API', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'ERROR', database: 'disconnected' });
  }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  const { name, type, price_per_day, image_url } = req.body;
  if (!name || !type || !Number.isFinite(Number(price_per_day)) || Number(price_per_day) <= 0) {
    return res.status(400).json({ message: 'Enter a vehicle name, type and valid daily price.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO vehicles (name, type, price_per_day, image_url) VALUES (?, ?, ?, ?)',
      [name, type, Number(price_per_day), image_url || '']
    );
    res.status(201).json({ id: result.insertId, message: 'Vehicle added successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  const { name, type, price_per_day, image_url, available } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE vehicles SET name=?, type=?, price_per_day=?, image_url=?, available=? WHERE id=?',
      [name, type, Number(price_per_day), image_url || '', Boolean(available), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle updated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vehicles WHERE id=?', [req.params.id]);
    res.json({ message: 'Vehicle deleted.' });
  } catch (error) {
    res.status(409).json({ message: 'Cannot delete a vehicle that has bookings. ' + error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, v.name AS vehicle_name, v.price_per_day
      FROM bookings b JOIN vehicles v ON v.id=b.vehicle_id
      ORDER BY b.created_at DESC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { customer_name, customer_email, vehicle_id, start_date, end_date } = req.body;
  if (!customer_name || !customer_email || !vehicle_id || !start_date || !end_date || end_date < start_date) {
    return res.status(400).json({ message: 'Complete all fields and choose a valid date range.' });
  }
  try {
    const [vehicles] = await pool.query('SELECT * FROM vehicles WHERE id=? AND available=TRUE', [vehicle_id]);
    if (!vehicles.length) return res.status(404).json({ message: 'Vehicle is not available.' });

    const [conflicts] = await pool.query(
      `SELECT id FROM bookings WHERE vehicle_id=? AND status IN ('Pending','Approved')
       AND NOT (end_date < ? OR start_date > ?)`,
      [vehicle_id, start_date, end_date]
    );
    if (conflicts.length) return res.status(409).json({ message: 'This vehicle already has a booking during those dates.' });

    const [result] = await pool.query(
      'INSERT INTO bookings (customer_name, customer_email, vehicle_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [customer_name, customer_email, vehicle_id, start_date, end_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Booking request submitted. Status: Pending.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/bookings/:id/status', async (req, res) => {
  const allowed = ['Pending', 'Approved', 'Rejected', 'Completed'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid booking status.' });
  try {
    const [result] = await pool.query('UPDATE bookings SET status=? WHERE id=?', [req.body.status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: `Booking ${req.body.status.toLowerCase()}.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch(error => { console.error(error); process.exit(1); });
