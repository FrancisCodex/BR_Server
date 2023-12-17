const pool = require('../config/database');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

exports.addReview = async (req, res) => {
    try {
        // Get the token from the Authorization header
        const token = req.headers.authorization.split(' ')[1];

        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        // Decode the token to get the user_id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;

        // Get the review information from the request body
        const { property_id, reviewText } = req.body;

        // Add the review to the database
        const result = await pool.query(
            'INSERT INTO boardroom.reviews (user_id, property_id, review_text) VALUES ($1, $2, $3) RETURNING *',
            [user_id, property_id, reviewText]
        );

        // Send the added review back to the client
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getReviews = async (req, res) => {
    try {
        // Get the property ID from the request parameters
        const { property_id } = req.params;

        // Get the reviews for the property from the database
        const result = await pool.query(
            'SELECT * FROM boardroom.reviews WHERE property_id = $1',
            [property_id]
        );

        // Send the reviews back to the client
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.deleteReview = async (req, res) => {
    try {
        // Get the review ID from the request parameters
        const { review_id } = req.params;

        // Delete the review from the database
        const result = await pool.query(
            'DELETE FROM boardroom.reviews WHERE review_id = $1 RETURNING *',
            [review_id]
        );

        // Send the deleted review back to the client
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

}
