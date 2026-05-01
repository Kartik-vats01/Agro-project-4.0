const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, poolConnect, sql } = require('../db');

const router = express.Router();

// ==========================================
// POST /api/auth/register
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, location, landArea, soilType, soilPH, irrigation } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !location || !landArea || !soilType || !soilPH || !irrigation) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    await poolConnect;

    // Check if email already exists
    const existing = await pool.request()
      .input('email', sql.VarChar, email.toLowerCase())
      .query('SELECT id FROM Farmers WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert farmer into database
    await pool.request()
      .input('name',      sql.VarChar, name)
      .input('email',     sql.VarChar, email.toLowerCase())
      .input('password',  sql.VarChar, hashedPassword)
      .input('phone',     sql.VarChar, phone)
      .input('location',  sql.VarChar, location)
      .input('landArea',  sql.Float,   parseFloat(landArea))
      .input('soilType',  sql.VarChar, soilType)
      .input('soilPH',    sql.Float,   parseFloat(soilPH))
      .input('irrigation',sql.VarChar, irrigation)
      .query(`
        INSERT INTO Farmers 
          (name, email, password, phone, location, land_acres, soil_type, soil_ph, irrigation)
        VALUES 
          (@name, @email, @password, @phone, @location, @landArea, @soilType, @soilPH, @irrigation)
      `);

    return res.status(201).json({ message: 'Registered successfully' });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error while registering' });
  }
});

// ==========================================
// POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    await poolConnect;

    // Find farmer by email
    const result = await pool.request()
      .input('email', sql.VarChar, email.toLowerCase())
      .query('SELECT * FROM Farmers WHERE email = @email');

    const farmer = result.recordset[0];
    if (!farmer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: farmer.id, name: farmer.name, email: farmer.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      farmer: {
        id:            farmer.id,
        name:          farmer.name,
        email:         farmer.email,
        selected_crop: farmer.selected_crop,
        land_acres:    farmer.land_acres
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error while logging in' });
  }
});

module.exports = router;