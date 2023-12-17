const pool = require('../config/database');

// Controller function to filter properties based on criteria
exports.filterProperties = async (req, res) => {
    try {
        // Get the filter criteria from the request query parameters
        const { address, city, amenities, price, type } = req.query;

        const result = await pool.query(
            'SELECT * FROM boardroom.filterListings($1, $2, $3, $4, $5)',
            [address || null, city || null, amenities || null, price || null, type || null]
        );
        
        console.log(result.rows);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error filtering properties:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
