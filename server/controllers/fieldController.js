const { pool, poolConnect, sql } = require('../db');

const getFields = async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request()
      .input('farmerId', sql.Int, req.user.farmerId)
      .query(`
        SELECT FieldID, FieldName, Area, CreatedAt
        FROM Fields
        WHERE FarmerID = @farmerId
        ORDER BY CreatedAt DESC
      `);

    return res.json({ fields: result.recordset });
  } catch (error) {
    console.error('Get fields error:', error);
    return res.status(500).json({ message: 'Server error while fetching fields.' });
  }
};

const createField = async (req, res) => {
  const { fieldName, area } = req.body;
  if (!fieldName || !area || Number.isNaN(Number(area)) || Number(area) <= 0) {
    return res.status(400).json({ message: 'Field name and valid area are required.' });
  }

  try {
    await poolConnect;

    const insertResult = await pool.request()
      .input('farmerId', sql.Int, req.user.farmerId)
      .input('fieldName', sql.NVarChar(150), fieldName)
      .input('area', sql.Float, parseFloat(area))
      .query(`
        INSERT INTO Fields (FarmerID, FieldName, Area)
        OUTPUT INSERTED.FieldID, INSERTED.FieldName, INSERTED.Area, INSERTED.CreatedAt
        VALUES (@farmerId, @fieldName, @area);
      `);

    const field = insertResult.recordset[0];
    return res.status(201).json({ field });
  } catch (error) {
    console.error('Create field error:', error);
    return res.status(500).json({ message: 'Server error while saving new field.' });
  }
};

module.exports = {
  getFields,
  createField,
};