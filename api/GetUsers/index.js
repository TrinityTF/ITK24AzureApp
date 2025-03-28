const { getPool } = require('../shared/db'); // Adjust path if needed

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for GetUsers.');

    try {
        const pool = getPool(); // Get the shared pool
        // Use pool.query directly for simplicity if you don't need transactions
        const [results] = await pool.query('SELECT * FROM resources');
        context.log(`Retrieved ${results.length} users.`);

        context.res = {
            status: 200,
            body: results, // Send the array of results
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        context.log.error('Database query failed:', error.message);
        context.res = {
            status: 500,
            body: { error: 'Failed to retrieve users' }, // Avoid sending detailed errors
            headers: { 'Content-Type': 'application/json' }
        };
    }
    // No connection to release if using pool.query
};