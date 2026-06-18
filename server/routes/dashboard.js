const express = require('express');
const authMiddleware = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const router = express.Router();

router.get('/dashboard', authMiddleware, dashboardController.getDashboard);
router.get('/crop-history', authMiddleware, dashboardController.getCropHistory);

module.exports = router;