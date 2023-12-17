const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {checkRole} = require('../middlewares/verifyRole');
const user = require('../controllers/userData');
const searching = require('../controllers/searching');
const filters = require('../controllers/filters');



router.get('/userdata', verifyToken, checkRole(["renter", "admin", "owner"]), user.userdata);
router.get('/query', searching.searchProperties );
router.get('/filters', filters.filterProperties);



module.exports = router