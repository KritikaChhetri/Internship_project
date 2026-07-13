const pool = require('../config/db');

const startAttempt = async (req, res) => {
  const { exam_id } = req.body;
  try {
    const existing = await pool.query(
      'SELECT * FROM attempts WHERE exam_id = $1 AND user_id = $2 AND status = $3',
      [exam_id, req.user.id, 'in_progress']
    );
    if (existing.rows.length > 0) {
      return res.json({ attempt: existing.rows[0] });
    }
    const result = await pool.query(
      'INSERT INTO attempts (exam_id, user_id) VALUES ($1, $2) RETURNING *',
      [exam_id, req.user.id]
    );
    res.status(201).json({ attempt: result.rows[0] });
  } catch (err) {
    console.error('Start attempt error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const submitAttempt = async (req, res) => {
  const { attempt_id, answers } = req.body;
  try {
    for (const ans of answers) {
      const question = await pool.query('SELECT correct_option FROM questions WHERE id = $1', [ans.question_id]);
      const is_correct = question.rows[0]?.correct_option === ans.selected_option;
      await pool.query(
        'INSERT INTO answers (attempt_id, question_id, selected_option, is_correct) VALUES ($1,$2,$3,$4)',
        [attempt_id, ans.question_id, ans.selected_option, is_correct]
      );
    }

    await pool.query('UPDATE attempts SET status = $1, submitted_at = NOW() WHERE id = $2', ['submitted', attempt_id]);

    const answersResult = await pool.query('SELECT * FROM answers WHERE attempt_id = $1', [attempt_id]);
    const total = answersResult.rows.length;
    const correct = answersResult.rows.filter(a => a.is_correct).length;
    const score = total > 0 ? (correct / total) * 100 : 0;
    const passed = score >= 50;

    const attempt = await pool.query('SELECT * FROM attempts WHERE id = $1', [attempt_id]);

    const resultRecord = await pool.query(
      'INSERT INTO results (attempt_id, user_id, exam_id, total_questions, correct_answers, score, passed) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [attempt_id, req.user.id, attempt.rows[0].exam_id, total, correct, score, passed]
    );

    res.json({ message: 'Exam submitted.', result: resultRecord.rows[0] });
  } catch (err) {
    console.error('Submit attempt error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getMyResults = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, e.title as exam_title FROM results r JOIN exams e ON r.exam_id = e.id WHERE r.user_id = $1 ORDER BY r.generated_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getAllResults = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, e.title as exam_title, u.name as candidate_name FROM results r JOIN exams e ON r.exam_id = e.id JOIN users u ON r.user_id = u.id ORDER BY r.generated_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get all results error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { startAttempt, submitAttempt, getMyResults, getAllResults };