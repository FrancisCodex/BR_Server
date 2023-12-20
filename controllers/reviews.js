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
        const decoded = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
        const user_id = decoded.userId;

        // Get the review information from the request body
        const { property_id, reviewText, rating } = req.body;

        console.log('Review: ', req.body)

        // Add the review to the database
        const result = await pool.query(
            'INSERT INTO boardroom.reviews (user_id, property_id, review_text, rating) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, property_id, reviewText, rating]
        );

        // Send the added review back to the client
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateReview = async (req, res) => {
    try{
        const { review_id } = req.params;
        const { reviewText, rating } = req.body;
        // Check if the user inputted review or rating
        if (reviewText && rating) {
            // Update both review_text and rating
            const result = await pool.query(
                'UPDATE boardroom.reviews SET review_text = $1, rating = $2 WHERE review_id = $3 RETURNING *',
                [reviewText, rating, review_id]
            );
            res.status(200).json(result.rows[0]);
        } else if (reviewText) {
            // Update only review_text
            const result = await pool.query(
                'UPDATE boardroom.reviews SET review_text = $1 WHERE review_id = $2 RETURNING *',
                [reviewText, review_id]
            );
            res.status(200).json(result.rows[0]);
        } else if (rating) {
            // Update only rating
            const result = await pool.query(
                'UPDATE boardroom.reviews SET rating = $1 WHERE review_id = $2 RETURNING *',
                [rating, review_id]
            );
            res.status(200).json(result.rows[0]);
        } else {
            // No changes specified
            res.status(400).json({ error: 'No changes specified' });
        }
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getReviews = async (req, res) => {
    try {
        // Get the property ID from the request parameters
        const { property_id } = req.params;

        // Get the reviews for the property from the database
        const result = await pool.query(
            'SELECT reviews.*, users.first_name FROM boardroom.reviews INNER JOIN boardroom.users ON reviews.user_id = users.user_id WHERE property_id = $1',
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
