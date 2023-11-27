const express = require('express');
const router = express.Router();
const authowner = require('../controllers/authowner');
const verifyToken = require('../middlewares/verifyToken');
const {checkRole} = require('../middlewares/verifyRole');
const property = require('../controllers/property');
// Prefix these routes with '/owners'
router.post('/login', authowner.login);
router.post('/register', authowner.register);

router.post('/upload/property', property.uploadproperty );
router.post('/edit/property', property.propertyedit );
router.post('/delete/property', property.deletelisting );



module.exports = router;
