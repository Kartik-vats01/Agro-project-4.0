const express = require('express');
const authMiddleware = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');
const router = express.Router();

router.post('/recommendations', authMiddleware, recommendationController.createRecommendation);

module.exports = router;