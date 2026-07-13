const express = require('express');
const router = express.Router();
const { startAttempt, submitAttempt, getMyResults, getAllResults } = require('../controllers/result.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/start', verifyToken, startAttempt);
router.post('/submit', verifyToken, submitAttempt);
router.get('/my', verifyToken, getMyResults);
router.get('/all', verifyToken, isAdmin, getAllResults);

module.exports = router;