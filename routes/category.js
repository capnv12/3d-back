const express = require('express');
const router = express.Router();

const {
	create,
	read,
	remove,
	list,
	photo
} = require('../controllers/category');
const {
	requireSignin,
	adminMiddleware,
	authMiddleware
} = require('../controllers/auth');
const { userById } = require('../controllers/user');

const { runValidation } = require('../validators/index');
const { categoryCreateValidator } = require('../validators/category');
const {
	userSignupValidator,
	userSigninValidator
} = require('../validators/auth');

router.post(
	'/categorie',
	runValidation,
	requireSignin,
	adminMiddleware,
	create
);
router.get('/categorii', list);
router.get('/categorie/:slug', read);
router.delete('/categorie/:slug', requireSignin, adminMiddleware, remove);
router.get('/categorie/photo/:slug', photo);

module.exports = router;
