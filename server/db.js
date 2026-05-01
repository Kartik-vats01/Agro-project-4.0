const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Agro@123',
  server: 'localhost',
  port: 1433,
  database: 'AgriDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => console.log('✅ Connected to AgriDB successfully'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

module.exports = { pool, poolConnect, sql };