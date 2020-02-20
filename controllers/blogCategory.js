const BlogCategory = require('../models/blogCategory');
const Blog = require('../models/blog');
const slugify = require('slugify');

exports.create = (req, res) => {
	const { name } = req.body;
	let slug = slugify(name).toLowerCase();

	let blogCategory = new BlogCategory({ name, slug });

	blogCategory.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		res.json(data);
	});
};
exports.list = (req, res) => {
	BlogCategory.find({}).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		res.json(data);
	});
};

exports.read = (req, res) => {
	let sortBy = req.body.sortBy ? req.body.sortBy : 'createdAt';
	let order = req.body.order ? req.body.order : 'desc';
	const slug = req.params.slug.toLowerCase();
	BlogCategory.findOne({ slug }).exec((err, category) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		// res.json(category)
		Blog.find({ blogCategories: category })
			.populate('blogCategories', '_id name slug')
			.populate('tags', '_id name slug')
			.populate('postedBy', '_id name')
			.select(
				'_id title slug excerpt blogCategories postedBy tags createdAt updatedAt'
			)
			.sort([[sortBy, order]])
			.exec((err, data) => {
				if (err) {
					return res.status(400).json({
						error: errorHandler(err)
					});
				}
				res.json({ category: category, blogs: data });
			});
	});
};

exports.remove = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	BlogCategory.findOneAndRemove({ slug }).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({
			message: 'Categoria a fost stearsa'
		});
	});
};
