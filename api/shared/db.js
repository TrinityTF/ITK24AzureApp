const mysql = require('mysql2/promise'); // Use promise version for async/await

let pool;

const config = {
    host: process.env.DB_HOST, // Get from environment variables
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5, // Adjust based on expected concurrency & Functions plan
    queueLimit: 0,
    connectTimeout: 10000,
    // Consider SSL options depending on your MySQL setup (Azure DB for MySQL often requires it)
    // ssl: { rejectUnauthorized: true } // Example if SSL is needed
};

/**
 * Returns a shared connection pool. Initializes it if not already created.
 */
function getPool() {
    if (!pool) {
        try {
            console.log('Initializing MySQL connection pool...');
            pool = mysql.createPool(config);
            // Optional: Listen for errors on the pool
            pool.on('error', (err) => {
                console.error('MySQL Pool Error:', err);
                // Attempt to gracefully handle or reset the pool if necessary
                pool = null; // Force re-initialization on next call
            });
            console.log('MySQL connection pool initialized.');
        } catch (error) {
            console.error('!!! Failed to create MySQL Pool:', error);
            throw new Error('Database pool initialization failed'); // Propagate error
        }
    }
    return pool;
}

module.exports = { getPool };