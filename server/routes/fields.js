const express = require('express');
const authMiddleware = require('../middleware/auth');
const fieldController = require('../controllers/fieldController');
const router = express.Router();

router.get('/fields', authMiddleware, fieldController.getFields);
router.post('/fields', authMiddleware, fieldController.createField);

module.exports = router;