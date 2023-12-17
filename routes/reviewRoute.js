const express = require('express');
const router = express.Router();
const review = require('../controllers/reviews');

router.get('/get/:property_id', review.getReviews);
router.delete('/del/:review_id', review.deleteReview);
router.post('/', review.addReview);

module.exports = router