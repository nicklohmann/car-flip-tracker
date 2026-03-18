const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// GET all cars
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single car by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new car
router.post('/', async (req, res) => {
  try {
    const {
      make, model, year, vin, mileage, drivetrain,
      title_status, damage_type, kbb_trade_in, kbb_private,
      iaa_acv, repair_estimate, contingency, labor_hours,
      labor_rate, iaa_fees, tax_reg_insurance, actual_bid, iaa_cost
    } = req.body;

    const result = await pool.query(
      `INSERT INTO cars (make, model, year, vin, mileage, drivetrain,
        title_status, damage_type, kbb_trade_in, kbb_private,
        iaa_acv, repair_estimate, contingency, labor_hours,
        labor_rate, iaa_fees, tax_reg_insurance, actual_bid, iaa_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [make, model, year, vin, mileage, drivetrain,
       title_status, damage_type, kbb_trade_in, kbb_private,
       iaa_acv, repair_estimate, contingency, labor_hours,
       labor_rate, iaa_fees, tax_reg_insurance, actual_bid, iaa_cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update car status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, sold_price, sold_date, sold_platform } = req.body;
    const result = await pool.query(
      `UPDATE cars SET status=$1, sold_price=$2, sold_date=$3, sold_platform=$4
       WHERE id=$5 RETURNING *`,
      [status, sold_price, sold_date, sold_platform, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE car
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cars WHERE id = $1', [id]);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update car images
router.patch('/:id/images', async (req, res) => {
  try {
    console.log('images route hit', req.params.id, req.body)
    const { id } = req.params
    const { images } = req.body
    const result = await pool.query(
      'UPDATE cars SET images=$1 WHERE id=$2 RETURNING *',
      [images, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.log('images route error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;