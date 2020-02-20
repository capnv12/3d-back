const Blog = require('../models/blog');
const BlogCategory = require('../models/blogCategory');
const Tag = require('../models/tag');
const User = require('../models/user');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const fs = require('fs');
const { smartTrim } = require('../helpers/smartTrim');

exports.create = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: 'Imaginea nu a putut fi incarcata'
			});
		}

		const { title, body, blogCategories, tags } = fields;

		if (!title || !title.length) {
			return res.status(400).json({
				error: 'Titlul este obligatoriu'
			});
		}

		if (!body || body.length < 200) {
			return res.status(400).json({
				error:
					'Continutul este prea scurt. Trebuie sa fie cel putin 200 de caractere'
			});
		}

		if (!blogCategories || blogCategories.length === 0) {
			return res.status(400).json({
				error: 'Cel putin o categorie trebuie sa fie selectata'
			});
		}

		if (!tags || tags.length === 0) {
			return res.status(400).json({
				error: 'Cel putin o eticheta trebuie sa fie selectata'
			});
		}

		let blog = new Blog();
		blog.title = title;
		blog.body = body;
		blog.excerpt = smartTrim(body, 320, ' ', ' ...');
		blog.slug = slugify(title).toLowerCase();
		blog.mtitle = `${title} | ${process.env.APP_NAME}`;
		blog.mdesc = stripHtml(body.substring(0, 160));
		blog.postedBy = req.user._id;
		// categories and tags
		let arrayOfCategories = blogCategories && blogCategories.split(',');
		let arrayOfTags = tags && tags.split(',');

		if (files.photo) {
			if (files.photo.size > 10000000) {
				return res.status(400).json({
					error: 'Image should be less then 1mb in size'
				});
			}
			blog.photo.data = fs.readFileSync(files.photo.path);
			blog.photo.contentType = files.photo.type;
		}

		blog.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			}
			// res.json(result);
			Blog.findByIdAndUpdate(
				result._id,
				{ $push: { blogCategories: arrayOfCategories } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					Blog.findByIdAndUpdate(
						result._id,
						{ $push: { tags: arrayOfTags } },
						{ new: true }
					).exec((err, result) => {
						if (err) {
							return res.status(400).json({
								error: err
							});
						} else {
							res.json(result);
						}
					});
				}
			});
		});
	});
};

// list, listAllBlogsCategoriesTags, read, remove, update

exports.list = (req, res) => {
	Blog.find({})
		.populate('blogCategories', '_id name slug')
		.populate('tags', '_id name slug')
		.populate('postedBy', '_id name username')
		.select(
			'_id title slug excerpt blogCategories tags postedBy createdAt updatedAt'
		)
		.exec((err, data) => {
			if (err) {
				return res.json({
					error: err
				});
			}
			res.json(data);
		});
};

exports.listAllBlogsCategoriesTags = (req, res) => {
	let limit = req.body.limit ? parseInt(req.body.limit) : 10;
	let skip = req.body.skip ? parseInt(req.body.skip) : 0;

	let blogs;
	let blogCategories;
	let tags;

	Blog.find({})
		.populate('blogCategories', '_id nume slug')
		.populate('tags', '_id name slug')
		.populate('postedBy', '_id name username profile')
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.select(
			'_id title slug excerpt blogCategories tags postedBy createdAt updatedAt'
		)
		.exec((err, data) => {
			if (err) {
				return res.json({
					error: err
				});
			}
			blogs = data; // blogs
			// get all categories
			BlogCategory.find({}).exec((err, c) => {
				if (err) {
					return res.json({
						error: err
					});
				}
				blogCategories = c; // categories
				// get all tags
				Tag.find({}).exec((err, t) => {
					if (err) {
						return res.json({
							error: err
						});
					}
					tags = t;
					// return all blogs categories tags
					res.json({ blogs, blogCategories, tags, size: blogs.length });
				});
			});
		});
};

exports.read = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Blog.findOne({ slug })
		// .select("-photo")
		.populate('blogCategories', '_id name slug')
		.populate('tags', '_id name slug')
		.populate('postedBy', '_id name username')
		.select(
			'_id title body slug mtitle mdesc blogCategories tags postedBy createdAt updatedAt'
		)
		.exec((err, data) => {
			if (err) {
				return res.json({
					error: err
				});
			}
			res.json(data);
		});
};

exports.remove = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Blog.findOneAndRemove({ slug }).exec((err, data) => {
		if (err) {
			return res.json({
				error: err
			});
		}
		res.json({
			message: 'Articolul a fost sters cu succes'
		});
	});
};

exports.update = (req, res) => {
	const slug = req.params.slug.toLowerCase();

	Blog.findOne({ slug }).exec((err, oldBlog) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}

		let form = new formidable.IncomingForm();
		form.keepExtensions = true;

		form.parse(req, (err, fields, files) => {
			if (err) {
				return res.status(400).json({
					error: 'Imaginea nu a putut fi incarcata'
				});
			}

			let slugBeforeMerge = oldBlog.slug;
			oldBlog = _.merge(oldBlog, fields);
			oldBlog.slug = slugBeforeMerge;

			const { body, desc, blogCategories, tags } = fields;

			if (body) {
				oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
				oldBlog.desc = stripHtml(body.substring(0, 160));
			}

			if (blogCategories) {
				oldBlog.blogCategories = blogCategories.split(',');
			}

			if (tags) {
				oldBlog.tags = tags.split(',');
			}

			if (files.photo) {
				if (files.photo.size > 10000000) {
					return res.status(400).json({
						error: 'Image should be less then 1mb in size'
					});
				}
				oldBlog.photo.data = fs.readFileSync(files.photo.path);
				oldBlog.photo.contentType = files.photo.type;
			}

			oldBlog.save((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				}
				// result.photo = undefined;
				res.json(result);
			});
		});
	});
};

exports.photo = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Blog.findOne({ slug })
		.select('photo')
		.exec((err, blog) => {
			if (err || !blog) {
				return res.status(400).json({
					error: err
				});
			}
			res.set('Content-Type', blog.photo.contentType);
			return res.send(blog.photo.data);
		});
};

exports.listRelated = (req, res) => {
	// console.log(req.body.blog);
	let limit = req.body.limit ? parseInt(req.body.limit) : 3;
	const { _id, blogCategories } = req.body.blog;

	Blog.find({ _id: { $ne: _id }, blogCategories: { $in: blogCategories } })
		.limit(limit)
		.populate('postedBy', '_id name username profile')
		.select('title slug excerpt postedBy createdAt updatedAt')
		.exec((err, blogs) => {
			if (err) {
				return res.status(400).json({
					error: 'Nu a fost gasit nici un articol'
				});
			}
			res.json(blogs);
		});
};
exports.listByDate = (req, res) => {
	let createdAt = 'desc';
	let sortBy = 'createdAt';
	let limit = 3;

	Blog.find()
		.populate('blogCategories', '_id name slug')
		.populate('tags', '_id name slug')
		.populate('postedBy', '_id name username')
		.select(
			'_id title excerpt slug mtitle mdesc blogCategories tags postedBy createdAt updatedAt'
		)
		.sort([[sortBy, createdAt]])
		.limit(limit)
		.exec((err, blogs) => {
			if (err) {
				return res.status(400).json({
					error: 'Nu a fost gasit nici un articol'
				});
			}
			res.json(blogs);
		});
};
//
exports.listSearch = (req, res) => {
	console.log(req.query);
	const { search } = req.query;
	if (search) {
		Blog.find(
			{
				$or: [
					{ title: { $regex: search, $options: 'i' } },
					{ body: { $regex: search, $options: 'i' } }
				]
			},
			(err, blogs) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				}
				res.json(blogs);
			}
		).select('-photo -body');
	}
};
