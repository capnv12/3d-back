const express = require('express');
const router = express.Router();
const {
	create,
	list,
	listAllBlogsCategoriesTags,
	read,
	listRelated,
	listSearch,
	remove,
	update,
	photo,
	listByDate
} = require('../controllers/blog');
const {
	authMiddleware,
	adminMiddleware,
	requireSignin,
	canUpdateDeleteBlog
} = require('../controllers/auth');

router.post('/blog', requireSignin, adminMiddleware, create);
router.get('/bloguri', list);
router.post('/bloguri-categorii-etichete', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignin, adminMiddleware, remove);
router.put('/blog/:slug', requireSignin, adminMiddleware, update);
router.get('/blog/photo/:slug', photo);
router.post('/bloguri/related', listRelated);
router.get('/bloguri/search', listSearch);
router.get('/bloguri/byDate', listByDate);

module.exports = router;
