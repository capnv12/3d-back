const Category = require('../models/category');
const Product = require('../models/product');
const slugify = require('slugify');
const formidable = require('formidable');
const fs = require('fs');

exports.create = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: 'Image could not upload'
			});
		}

		const { name } = fields;

		let category = new Category();
		category.name = name;
		category.slug = slugify(name).toLowerCase();

		if (files.photo) {
			if (files.photo.size > 10000000) {
				return res.status(400).json({
					error: 'Image should be less then 1mb in size'
				});
			}
			category.photo.data = fs.readFileSync(files.photo.path);
			category.photo.contentType = files.photo.type;
		}

		category.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			res.json(result);
		});
	});
};

exports.photo = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Brand.findOne({ slug })
		.select('photo')
		.exec((err, brand) => {
			if (err || !brand) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			res.set('Content-Type', brand.photo.contentType);
			return res.send(brand.photo.data);
		});
};

exports.list = (req, res) => {
	Category.find({}).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		res.json(data);
	});
};

exports.read = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Category.findOne({ slug }).exec((err, category) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		// res.json(category)
		Product.find({ categories: category })
			.populate('category', '_id name slug')
			.select(
				'_id name excerpt slug category pret pretRedus SKU inStoc cantitate sold createdAt updatedAt'
			)
			.exec((err, data) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				}
				res.json({ category: category, product: data });
			});
	});
};

exports.remove = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Category.findOneAndRemove({ slug }).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		res.json({
			message: 'Categoria a fost stearsa'
		});
	});
};
