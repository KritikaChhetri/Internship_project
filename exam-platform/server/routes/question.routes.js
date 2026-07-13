const express = require('express');
const router = express.Router();
const { addQuestion, getAllQuestions, deleteQuestion } = require('../controllers/question.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getAllQuestions);
router.post('/', verifyToken, isAdmin, addQuestion);
router.delete('/:id', verifyToken, isAdmin, deleteQuestion);

module.exports = router;