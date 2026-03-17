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

// GET all parts for a car
router.get('/:car_id/parts', async (req, res) => {
  try {
    const { car_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM parts WHERE car_id = $1 ORDER BY id ASC',
      [car_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new part for a car
router.post('/:car_id/parts', async (req, res) => {
  try {
    const { car_id } = req.params;
    const { part_name, vendor, cost } = req.body;
    const result = await pool.query(
      `INSERT INTO parts (car_id, part_name, vendor, cost)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [car_id, part_name, vendor, cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a part
router.delete('/:car_id/parts/:part_id', async (req, res) => {
  try {
    const { part_id } = req.params;
    await pool.query('DELETE FROM parts WHERE id = $1', [part_id]);
    res.json({ message: 'Part deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;