const { pool, poolConnect, sql } = require('../db');

const getDashboard = async (req, res) => {
  try {
    await poolConnect;

    const farmerResult = await pool.request()
      .input('farmerId', sql.Int, req.user.farmerId)
      .query(`
        SELECT FarmerID, FullName, Email, CreatedAt
        FROM Farmers
        WHERE FarmerID = @farmerId
      `);

    const farmer = farmerResult.recordset[0];
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }

    const assignmentsResult = await pool.request()
      .input('farmerId', sql.Int, req.user.farmerId)
      .query(`
        SELECT a.AssignmentID, f.FieldName, a.CropName, a.AssignedDate
        FROM FieldCropAssignments AS a
        INNER JOIN Fields AS f ON a.FieldID = f.FieldID
        WHERE a.FarmerID = @farmerId AND a.Status = 'Active'
        ORDER BY a.AssignedDate DESC
      `);

    return res.json({
      profile: {
        fullName: farmer.FullName,
        email: farmer.Email,
        createdAt: farmer.CreatedAt,
      },
      activeAssignments: assignmentsResult.recordset,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Server error while fetching dashboard.' });
  }
};

const getCropHistory = async (req, res) => {
  try {
    await poolConnect;

    const historyResult = await pool.request()
      .input('farmerId', sql.Int, req.user.farmerId)
      .query(`
        SELECT a.AssignmentID, f.FieldName, a.CropName, a.AssignedDate
        FROM FieldCropAssignments AS a
        INNER JOIN Fields AS f ON a.FieldID = f.FieldID
        WHERE a.FarmerID = @farmerId AND a.Status = 'Completed'
        ORDER BY a.AssignedDate DESC
      `);

    return res.json({ history: historyResult.recordset });
  } catch (error) {
    console.error('Crop history error:', error);
    return res.status(500).json({ message: 'Server error while fetching crop history.' });
  }
};

module.exports = {
  getDashboard,
  getCropHistory,
};