const pool = require('../config/db');

const addQuestion = async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, topic, difficulty } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option, topic, difficulty, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [question_text, option_a, option_b, option_c, option_d, correct_option, topic, difficulty || 'medium', req.user.id]
    );
    res.status(201).json({ message: 'Question added.', question: result.rows[0] });
  } catch (err) {
    console.error('Add question error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM questions WHERE id = $1', [id]);
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { addQuestion, getAllQuestions, deleteQuestion };