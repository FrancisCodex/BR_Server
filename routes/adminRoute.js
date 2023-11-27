const express = require('express');
const router = express.Router();
const authUser = require('../controllers/auth');
const authowner = require('../controllers/authowner');
const verifyToken = require('../middlewares/verifyToken');
const {checkRole} = require('../middlewares/verifyRole');
const property = require('../controllers/property');



router.get('/test', authUser.test);

router.post('/upload', verifyToken, checkRole(["admin"]), property.uploadproperty );



module.exports = router