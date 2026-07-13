const express = require('express');
const router = express.Router();
const { createExam, getAllExams, getExamById } = require('../controllers/exam.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getAllExams);
router.get('/:id', verifyToken, getExamById);
router.post('/', verifyToken, isAdmin, createExam);

module.exports = router;