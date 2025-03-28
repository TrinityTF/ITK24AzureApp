const { getPool } = require('../shared/db'); // Adjust path if needed

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for CheckConnection.');

    let connection;
    try {
        const pool = getPool(); // Get the shared pool
        connection = await pool.getConnection(); // Try to get a connection
        await connection.ping(); // Simple check if connection is alive
        context.log('Database connection successful.');
        context.res = {
            status: 200,
            body: { connected: true },
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        context.log.error('Database connection failed:', error.message);
        context.res = {
            status: 500,
            body: { connected: false, error: 'Database connection failed' }, // Avoid sending detailed errors
            headers: { 'Content-Type': 'application/json' }
        };
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
            context.log('Database connection released.');
        }
    }
};