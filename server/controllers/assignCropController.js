const { pool, poolConnect, sql } = require('../db');

const injectIds = (request, ids, prefix) => {
  return ids.map((id, index) => {
    const param = `@${prefix}${index}`;
    request.input(param, sql.Int, id);
    return param;
  });
};

const assignCrop = async (req, res) => {
  const { cropName, fieldIds, forceReplace = false } = req.body;
  if (!cropName || !Array.isArray(fieldIds) || fieldIds.length === 0) {
    return res.status(400).json({ message: 'Crop name and selected fields are required.' });
  }

  const uniqueFieldIds = [...new Set(fieldIds.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id)))];
  if (uniqueFieldIds.length === 0) {
    return res.status(400).json({ message: 'At least one valid field ID is required.' });
  }

  try {
    await poolConnect;

    const fieldRequest = pool.request();
    fieldRequest.input('farmerId', sql.Int, req.user.farmerId);
    const fieldParams = injectIds(fieldRequest, uniqueFieldIds, 'field');
    const fieldClause = fieldParams.join(', ');

    const fieldResult = await fieldRequest.query(`
      SELECT FieldID, FieldName
      FROM Fields
      WHERE FarmerID = @farmerId AND FieldID IN (${fieldClause})
    `);

    if (fieldResult.recordset.length !== uniqueFieldIds.length) {
      return res.status(400).json({ message: 'One or more selected fields are invalid.' });
    }

    const activeRequest = pool.request();
    activeRequest.input('farmerId', sql.Int, req.user.farmerId);
    injectIds(activeRequest, uniqueFieldIds, 'field');
    const activeResult = await activeRequest.query(`
      SELECT AssignmentID, FieldID, CropName, AssignedDate
      FROM FieldCropAssignments
      WHERE FarmerID = @farmerId AND FieldID IN (${fieldClause}) AND Status = 'Active'
    `);

    if (activeResult.recordset.length > 0 && !forceReplace) {
      return res.status(409).json({
        message: 'This field already has an active crop assigned.',
        conflicts: activeResult.recordset,
      });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      if (activeResult.recordset.length > 0) {
        const transactionRequest = transaction.request();
        const assignmentIds = activeResult.recordset.map((assignment) => assignment.AssignmentID);
        const assignmentParams = injectIds(transactionRequest, assignmentIds, 'assignment');
        const assignmentClause = assignmentParams.join(', ');

        await transactionRequest.query(`
          UPDATE FieldCropAssignments
          SET Status = 'Completed'
          WHERE AssignmentID IN (${assignmentClause})
        `);
      }

      const insertedAssignments = [];
      for (const fieldId of uniqueFieldIds) {
        const insertRequest = transaction.request();
        insertRequest.input('farmerId', sql.Int, req.user.farmerId);
        insertRequest.input('fieldId', sql.Int, fieldId);
        insertRequest.input('cropName', sql.NVarChar(100), cropName);

        const insertResult = await insertRequest.query(`
          INSERT INTO FieldCropAssignments
            (FarmerID, FieldID, CropName, Status)
          OUTPUT INSERTED.AssignmentID, INSERTED.FieldID, INSERTED.CropName, INSERTED.Status, INSERTED.AssignedDate
          VALUES (@farmerId, @fieldId, @cropName, 'Active')
        `);
        insertedAssignments.push(insertResult.recordset[0]);
      }

      await transaction.commit();

      return res.json({
        message: 'Crop assignment saved successfully.',
        assigned: insertedAssignments,
      });
    } catch (transactionError) {
      await transaction.rollback();
      console.error('Assignment transaction error:', transactionError);
      return res.status(500).json({ message: 'Server error while assigning crop.' });
    }
  } catch (error) {
    console.error('Assign crop error:', error);
    return res.status(500).json({ message: 'Server error while assigning crop.' });
  }
};

module.exports = {
  assignCrop,
};