const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {checkRole} = require('../middlewares/verifyRole');
const user = require('../controllers/userData');



router.get('/userdata', verifyToken, checkRole(["renter", "admin", "owner"]), user.userdata);



module.exports = router