const express = require('express');
const jwt = require('jsonwebtoken');
const { pool, poolConnect, sql } = require('../db');

const router = express.Router();

// Middleware — verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==========================================
// GET /api/dashboard/profile
// ==========================================
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query(`
        SELECT id, name, email, phone, location, 
               land_acres, soil_type, soil_ph, 
               irrigation, selected_crop 
        FROM Farmers WHERE id = @id
      `);

    const farmer = result.recordset[0];
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    return res.json(farmer);

  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// ==========================================
// POST /api/dashboard/select-crop
// ==========================================
router.post('/select-crop', authMiddleware, async (req, res) => {
  try {
    const { selected_crop, land_acres } = req.body;

    if (!selected_crop || land_acres === undefined) {
      return res.status(400).json({ message: 'Crop and land acres are required' });
    }

    const landValue = parseFloat(land_acres);
    if (isNaN(landValue) || landValue <= 0) {
      return res.status(400).json({ message: 'Land acres must be a positive number' });
    }

    await poolConnect;

    await pool.request()
      .input('crop',  sql.VarChar, selected_crop)
      .input('acres', sql.Float,   landValue)
      .input('id',    sql.Int,     req.user.id)
      .query('UPDATE Farmers SET selected_crop = @crop, land_acres = @acres WHERE id = @id');

    return res.json({
      message: 'Crop saved successfully',
      selected_crop,
      land_acres: landValue
    });

  } catch (error) {
    console.error('Select crop error:', error);
    return res.status(500).json({ message: 'Server error while saving crop' });
  }
});

module.exports = router;