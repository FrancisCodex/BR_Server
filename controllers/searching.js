const pool = require('../config/database');

exports.searchProperties = async (req, res) => {
    try {
      console.log('Searching properties');
      const { keyword, city, type } = req.query;

      // Call the searchListings function with the provided parameters
      const result = await pool.query(
        'SELECT * FROM boardroom.searchListing7($1, $2, $3)',
        [keyword || null, type || null, city || null]
      );

      // Return the search results
      res.json(result.rows);
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};
