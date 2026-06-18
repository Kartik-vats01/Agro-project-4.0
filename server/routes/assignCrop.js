const express = require('express');
const authMiddleware = require('../middleware/auth');
const assignCropController = require('../controllers/assignCropController');
const router = express.Router();

router.post('/assign-crop', authMiddleware, assignCropController.assignCrop);

module.exports = router;