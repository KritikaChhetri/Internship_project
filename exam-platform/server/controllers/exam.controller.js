const pool = require('../config/db');

const createExam = async (req, res) => {
  const { title, description, duration_minutes, start_time, end_time, question_ids } = req.body;
  try {
    const examResult = await pool.query(
      'INSERT INTO exams (title, description, duration_minutes, start_time, end_time, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, description, duration_minutes, start_time, end_time, req.user.id]
    );
    const exam = examResult.rows[0];

    for (const qid of question_ids) {
      await pool.query(
        'INSERT INTO exam_questions (exam_id, question_id) VALUES ($1,$2)',
        [exam.id, qid]
      );
    }

    res.status(201).json({ message: 'Exam created successfully.', exam });
  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getAllExams = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exams ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get exams error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await pool.query('SELECT * FROM exams WHERE id = $1', [id]);
    if (exam.rows.length === 0) return res.status(404).json({ message: 'Exam not found.' });

    const questions = await pool.query(
      'SELECT q.* FROM questions q JOIN exam_questions eq ON q.id = eq.question_id WHERE eq.exam_id = $1',
      [id]
    );

    res.json({ ...exam.rows[0], questions: questions.rows });
  } catch (err) {
    console.error('Get exam error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { createExam, getAllExams, getExamById };