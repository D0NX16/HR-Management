const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await support
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env

const pool = mysql.createPool({ // Changed to createPool
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true, // If true, the pool will queue requests when no connections are available
  connectionLimit: 10,      // Maximum number of connections in the pool
  queueLimit: 0             // The maximum number of connection requests the pool will queue
});

// Test the connection pool (optional, but good practice)
pool.getConnection()
  .then(connection => {
    console.log('*** Database connected successfully');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to the database pool:', err.stack);
  });

module.exports = pool; // Export the pool