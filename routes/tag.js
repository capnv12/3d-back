const express = require('express');
const router = express.Router();
const { create, list, read, remove } = require('../controllers/tag');
const {
	authMiddleware,
	adminMiddleware,
	requireSignin
} = require('../controllers/auth');

//validators
const { runValidation } = require('../validators/index');
const { tagCreateValidator } = require('../validators/tag');

router.post(
	'/eticheta',
	tagCreateValidator,
	runValidation,
	requireSignin,
	adminMiddleware,
	create
);
router.get('/etichete', list);
router.get('/eticheta/:slug', read);
router.delete('/eticheta/:slug', requireSignin, adminMiddleware, remove);
module.exports = router;
