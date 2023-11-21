const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');
const refreshTokenController = require('../controllers/refreshtokenController');
const verifyToken = require('../middlewares/verifyToken');
const {checkRole} = require('../middlewares/verifyRole');

// Prefix these routes with '/renters'
router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/logout', auth.logout);


//access token refresher
router.get('/refresh', refreshTokenController.refreshToken);

//Check Reset Token for Change Pass
router.post('/checkResetToken', auth.checkResetToken);
//Resetpassword route
router.post('/resetPassword', auth.resetPassword);
//verify email
router.get('/verify', auth.verifyEmail);
router.post('/requestVerification', auth.resendVerificationEmail);
//get userdata
router.get('/userdata', verifyToken, checkRole(["renter", "admin", "owner"]), auth.userdata);

router.get('/test', auth.test);



module.exports = router;
