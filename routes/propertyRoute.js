const express = require('express');
const router = express.Router();
const authUser = require('../controllers/auth');
const authowner = require('../controllers/authowner');
const verifyToken = require('../middlewares/verifyToken');
const {checkRole} = require('../middlewares/verifyRole');
const property = require('../controllers/property');
const multer = require('multer');

const imageUpload = multer({

    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './images/property_images');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + file.originalname);
        }
    }),
});


// router.get('/test', authUser.test);
// router.post('/testupload', imageUpload.single('images'), property.uploadtest);

router.post('/upload', imageUpload.single('images'), verifyToken, checkRole(["admin", "owner"]), property.uploadproperty);
router.post('/edit', verifyToken, checkRole(["admin", "owner"]), property.propertyedit );
router.get('/view/:id', verifyToken, checkRole(["admin", "owner"]), property.viewproperty );
router.post('/list', verifyToken, checkRole(["admin", "owner"]), property.propertylistings );
router.delete('/delete/:id', verifyToken, checkRole(["admin", "owner"]), property.deletelisting );



module.exports = router