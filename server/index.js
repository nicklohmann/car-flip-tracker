const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
const carsRouter = require('./routes/cars');
app.use('/api/cars', carsRouter);

const partsRouter = require('./routes/parts');
app.use('/api/cars', partsRouter);

const imagesRouter = require('./routes/images');
app.use('/api/images', imagesRouter);

const estimateRouter = require('./routes/estimate');
app.use('/api/ai', estimateRouter);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Car Flip Tracker API is running' });
});

// Test database connection
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected!', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
