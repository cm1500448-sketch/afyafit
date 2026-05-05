
const mysql = require('mysql2');

require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',  // Database server hostname or IP address
    port: process.env.DB_PORT || 3306,     // Database server port number
    user: process.env.DB_USER || 'root',     // Database username for authentication
    password: process.env.DB_PASSWORD || '',     // Database password for authentication
    database: process.env.DB_NAME || 'youth_fitness', // Name of the database to connect to
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();