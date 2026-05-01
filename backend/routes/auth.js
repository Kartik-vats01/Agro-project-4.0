const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, poolConnect, sql } = require('../db');

const router = express.Router();

// ==========================================
// REGISTER
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, location, landArea, soilType, soilPH, irrigation } = req.body;

    // Validate all fields
    if (!name || !email || !password || !phone || !location || !landArea || !soilType || !soilPH || !irrigation) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    await poolConnect; // wait for DB connection

    // Check if email already exists
    const checkResult = await pool.request()
      .input('email', sql.VarChar, email.toLowerCase())
      .query('SELECT id FROM Farmers WHERE email = @email');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into MSSQL
    await pool.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email.toLowerCase())
      .input('password', sql.VarChar, hashedPassword)
      .input('phone', sql.VarChar, phone)
      .input('location', sql.VarChar, location)
      .input('landArea', sql.Float, parseFloat(landArea))
      .input('soilType', sql.VarChar, soilType)
      .input('soilPH', sql.Float, parseFloat(soilPH))
      .input('irrigation', sql.VarChar, irrigation)
      .query(`
        INSERT INTO Farmers 
        (name, email, password, phone, location, land_acres, soil_type, soil_ph, irrigation)
        VALUES 
        (@name, @email, @password, @phone, @location, @landArea, @soilType, @soilPH, @irrigation)
      `);

    res.status(201).json({ message: 'Registration successful' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error while registering' });
  }
});

// ==========================================
// LOGIN
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

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const farmer = result.recordset[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: farmer.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      farmer: {
        id: farmer.id,
        name: farmer.name,
        email: farmer.email,
        selected_crop: farmer.selected_crop,
        land_acres: farmer.land_acres
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error while logging in' });
  }
});

// ==========================================
// GET PROFILE (Protected)
// ==========================================
router.get('/profile', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await poolConnect;

    // Fetch farmer from MSSQL
    const result = await pool.request()
      .input('id', sql.Int, decoded.userId)
      .query('SELECT id, name, email, phone, location, land_acres, soil_type, soil_ph, irrigation, selected_crop FROM Farmers WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

module.exports = router;