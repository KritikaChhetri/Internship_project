const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  const { attempt_id, violation_type } = req.body;
  try {
    await pool.query(
      'INSERT INTO violations (attempt_id, violation_type) VALUES ($1, $2)',
      [attempt_id, violation_type]
    );
    res.status(201).json({ message: 'Violation logged.' });
  } catch (err) {
    console.error('Violation log error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/:attempt_id', verifyToken, async (req, res) => {
  const { attempt_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM violations WHERE attempt_id = $1 ORDER BY occurred_at ASC',
      [attempt_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get violations error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;