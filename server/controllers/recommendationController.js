const { pool, poolConnect, sql } = require('../db');

const scoreParam = (value, min, max) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 1;
  if (numeric >= min && numeric <= max) return 3;
  const distance = Math.min(Math.abs(numeric - min), Math.abs(numeric - max));
  return Math.max(0, 3 - distance / 10);
};

const buildRecommendations = (params) => {
  const crops = [
    { name: 'Wheat', emoji: '🌾' },
    { name: 'Rice', emoji: '🌾' },
    { name: 'Maize', emoji: '🌽' },
  ];

  return crops.map((crop) => ({
    name: crop.name,
    emoji: crop.emoji,
    score:
      scoreParam(params.temperature, crop.name === 'Wheat' ? 12 : 18, crop.name === 'Wheat' ? 25 : 32) +
      scoreParam(params.rainfall, crop.name === 'Rice' ? 100 : 50, crop.name === 'Rice' ? 300 : 120) +
      scoreParam(params.ph, 5.5, 7) +
      scoreParam(params.humidity, 50, 90),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((crop, index) => ({
      ...crop,
      rank: index + 1,
      label: crop.name,
    }));
};

const createRecommendation = async (req, res) => {
  const {
    nitrogen,
    phosphorus,
    potassium,
    ph,
    humidity,
    rainfall,
    temperature,
  } = req.body;

  const params = {
    nitrogen,
    phosphorus,
    potassium,
    ph,
    humidity,
    rainfall,
    temperature,
  };

  const recommendations = buildRecommendations(params);

  try {
    await poolConnect;

    await pool.request()
      .input('farmerId', sql.Int, req.user.farmerId)
      .input('crop1', sql.NVarChar(100), recommendations[0]?.name || null)
      .input('crop2', sql.NVarChar(100), recommendations[1]?.name || null)
      .input('crop3', sql.NVarChar(100), recommendations[2]?.name || null)
      .query(`
        INSERT INTO CropRecommendations
          (FarmerID, SuggestedCrop1, SuggestedCrop2, SuggestedCrop3)
        VALUES
          (@farmerId, @crop1, @crop2, @crop3);
      `);

    return res.json({ recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    return res.status(500).json({ message: 'Server error while generating recommendations.' });
  }
};

module.exports = {
  createRecommendation,
};