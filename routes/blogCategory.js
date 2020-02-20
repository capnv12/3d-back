const express = require('express');
const router = express.Router();

const { create, read, remove, list } = require('../controllers/blogCategory');
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
	'/categorie-blog',
	categoryCreateValidator,
	runValidation,
	requireSignin,
	adminMiddleware,
	create
);
router.get('/categorii-blog', list);
router.get('/categorie-blog/:slug', read);
router.delete('/categorie-blog/:slug', requireSignin, adminMiddleware, remove);

module.exports = router;
