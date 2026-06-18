const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, poolConnect, sql } = require('../db');

const register = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    location,
    landArea,
    soilType,
    soilPH,
    irrigation,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    await poolConnect;

    const existing = await pool.request()
      .input('email', sql.NVarChar(255), email.toLowerCase())
      .query('SELECT FarmerID FROM Farmers WHERE Email = @email');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.request()
      .input('name', sql.NVarChar(150), name)
      .input('email', sql.NVarChar(255), email.toLowerCase())
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('phone', sql.NVarChar(20), phone || null)
      .input('location', sql.NVarChar(200), location || null)
      .input('landArea', sql.Float, landArea ? parseFloat(landArea) : null)
      .input('soilType', sql.NVarChar(100), soilType || null)
      .input('soilPH', sql.Float, soilPH ? parseFloat(soilPH) : null)
      .input('irrigation', sql.NVarChar(100), irrigation || null)
      .query(`
        INSERT INTO Farmers
          (FullName, Email, PasswordHash, Phone, Location, LandArea, SoilType, SoilPH, Irrigation)
        VALUES
          (@name, @email, @passwordHash, @phone, @location, @landArea, @soilType, @soilPH, @irrigation)
      `);

    return res.status(201).json({ message: 'Registered successfully.' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error while registering.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    await poolConnect;

    const result = await pool.request()
      .input('email', sql.NVarChar(255), email.toLowerCase())
      .query('SELECT FarmerID, FullName, Email, PasswordHash, CreatedAt FROM Farmers WHERE Email = @email');

    const farmer = result.recordset[0];
    if (!farmer) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, farmer.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        farmerId: farmer.FarmerID,
        fullName: farmer.FullName,
        email: farmer.Email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      farmer: {
        farmerId: farmer.FarmerID,
        fullName: farmer.FullName,
        email: farmer.Email,
        createdAt: farmer.CreatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
};

module.exports = { register, login };