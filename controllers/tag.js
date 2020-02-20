const Tag = require('../models/tag');
const Blog = require('../models/blog');
const slugify = require('slugify');

exports.create = (req, res) => {
	const { name } = req.body;
	let slug = slugify(name).toLowerCase();

	let tag = new Tag({ name, slug });

	tag.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		res.json(data);
	});
};
exports.list = (req, res) => {
	Tag.find({}).exec((err, data) => {
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
	Tag.findOne({ slug }).exec((err, tag) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		// res.json(tag)
		Blog.find({ tags: tag })
			.populate('tags', '_id name slug')
			.populate('blogCategories', '_id name slug')
			.populate('postedBy', '_id name')
			.select(
				'_id title slug excerpt blogCategories postedBy tags createdAt updatedAt'
			)
			.sort([[sortBy, order]])
			.exec((err, data) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				}
				res.json({ tag: tag, blogs: data });
			});
	});
};
exports.remove = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Tag.findOneAndRemove({ slug }).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		res.json({
			message: 'Eticheta a fost stearsa'
		});
	});
};
