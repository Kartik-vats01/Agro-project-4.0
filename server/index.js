const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
require('./db');

const authRoutes = require('./routes/auth');
const recommendationRoutes = require('./routes/recommendations');
const fieldRoutes = require('./routes/fields');
const assignCropRoutes = require('./routes/assignCrop');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

app.use('/api', authRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', fieldRoutes);
app.use('/api', assignCropRoutes);
app.use('/api', dashboardRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});