const express = require('express');
const router = express.Router();
const {
	create,
	list,
	listAllProductsCategories,
	read,
	remove,
	update,
	photo,
	listRelated,
	listSearch,
	listBySearch,
	listBySearchBrand,
	listByNew
} = require('../controllers/product');
const {
	authMiddleware,
	adminMiddleware,
	requireSignin,
	canUpdateDeleteBlog
} = require('../controllers/auth');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});
var upload = multer({
	storage: cloudinaryStorage({
		cloudinary: cloudinary,
		folder: 'products', // will not be used
		allowedFormats: ['jpg', 'png'],
		filename: function(req, file, cb) {
			cb(undefined, file.originalname);
		}
	})
});
uploadLocally = multer({ storage: storage });

router.post(
	'/produs',
	upload.array('photo', 10),
	requireSignin,
	adminMiddleware,
	create
);
router.get('/produse', list);
router.post('/produse-categorii', listAllProductsCategories);
router.get('/produs/:slug', read);
router.delete('/produs/:slug', requireSignin, adminMiddleware, remove);
router.put(
	'/produs/:slug',
	upload.array('photo', 10),
	requireSignin,
	adminMiddleware,
	update
);
router.get('/produs/photo/:slug', photo);
router.post('/produse/related', listRelated);
router.get('/produse/search', listSearch);
router.post('/produse/filtre', listBySearch);
router.get('/produse/nou', listByNew);

module.exports = router;
