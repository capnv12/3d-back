const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const fs = require('fs');
const { smartTrim } = require('../helpers/smartTrim');

exports.create = (req, res) => {
	// console.log(req.file);

	let {
		name,
		descriere,
		categories,
		SKU,
		inStoc,
		pret,
		pretRedus,
		cantitate,
		sold,
		ordine
	} = req.body;
	let excerpt = stripHtml(descriere.substring(0, 320));
	let slug = slugify(name).toLowerCase();
	let mtitle = `${name} | ${process.env.APP_NAME}`;
	let mdesc = stripHtml(descriere.substring(0, 160));
	let arrayOfCategories = categories && categories.split(',');

	let product = new Product({
		name,
		mtitle,
		mdesc,
		slug,
		photo: req.files,
		descriere,
		SKU,
		inStoc,
		pret,
		pretRedus,
		cantitate,
		sold,
		ordine,
		excerpt
	});
	// let categorie;
	// let eticheta;
	// let brand;
	// let tipProdus;

	product.save((err, result) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		// console.log(result._id);

		Product.findByIdAndUpdate(
			result._id,
			{ $push: { categories: arrayOfCategories } },
			{ new: true }
		).exec((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			} else {
				console.log(result);
				res.json(result);
			}
		});
	});
};

exports.list = (req, res) => {
	Product.find({})
		.populate('categories', '_id name slug')
		.sort({ createdAt: -1 })
		.select(
			'_id name slug excerpt photo cetegories pret pretRedus SKU inStoc cantitate sold ordine  createdAt updatedAt'
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

exports.listAllProductsCategories = (req, res) => {
	let limit = req.body.limit ? parseInt(req.body.limit) : 10;
	let skip = req.body.skip ? parseInt(req.body.skip) : 0;

	let products;
	let categories;

	Product.find({})
		.populate('categories', '_id name slug')
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.select(
			'_id name slug excerpt photo cetegories pret pretRedus SKU inStoc cantitate sold ordine  createdAt updatedAt'
		)
		.exec((err, data) => {
			if (err) {
				return res.json({
					error: err
				});
			}
			products = data; // blogs
			// get all categories
			// console.log(products)
			Category.find({}).exec((err, c) => {
				if (err) {
					return res.json({
						error: err
					});
				}
				categories = c; // categories
				// get all tags

				res.json({
					products,
					categories,
					size: products.length
				});
			});
		});
};

exports.read = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Product.findOne({ slug })
		// .select("-photo")
		.populate('categorie', '_id name slug')
		.select(
			'_id name mdesc photo mtitle slug excerpt descriere categories pret pretRedus SKU inStoc cantitate sold ordine createdAt updatedAt'
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
	Product.findOneAndRemove({ slug }).exec((err, data) => {
		if (err) {
			return res.json({
				error: err
			});
		}
		res.json({
			message: 'Produse sters cu succes'
		});
	});
};

exports.update = (req, res) => {
	const slug = req.params.slug.toLowerCase();

	Product.findOne({ slug }).exec((err, oldProduct) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}

		let slugBeforeMerge = oldProduct.slug;
		oldProduct = _.merge(oldProduct, req.body);
		oldProduct.slug = slugBeforeMerge;

		const {
			name,
			descriere,
			categories,
			SKU,
			inStoc,
			excerpt,
			pret,
			pretRedus,
			cantitate,
			sold,
			ordine
		} = req.body;

		oldProduct.photo = req.files;

		if (categories) {
			oldProduct.categories = categories.split(',');
		}

		oldProduct.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: 'stoped here'
				});
			}
			console.log(result);
			// result.photo = undefined;
			res.json(result);
		});
	});
};

exports.update = (req, res) => {
	const slug = req.params.slug.toLowerCase();

	Product.findOne({ slug }).exec((err, oldProduct) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}

		let slugBeforeMerge = oldProduct.slug;
		oldProduct = _.merge(oldProduct, req.body);
		oldProduct.slug = slugBeforeMerge;

		const {
			name,
			descriere,
			categories,
			SKU,
			inStoc,
			excerpt,
			pret,
			pretRedus,
			cantitate,
			sold,
			ordine
		} = req.body;

		oldProduct.photo = req.files;

		if (categories) {
			oldProduct.categories = categories.split(',');
		}

		oldProduct.save((err, result) => {
			// if (err) {
			// 	return res.status(400).json({
			// 		error: errorHandler(err)
			// 	});
			// }
			// console.log(result);
			// result.photo = undefined;
			res.json(result);
		});
	});
};

exports.photo = (req, res) => {
	const slug = req.params.slug.toLowerCase();
	Product.findOne({ slug })
		.select('photo')
		.exec((err, product) => {
			if (err || !product) {
				return res.status(400).json({
					error: err
				});
			}
			// res.set('Content-Type', product.photo.contentType);
			return res.send(product.photo);
		});
};

exports.listRelated = (req, res) => {
	// console.log(req.body.blog);
	let limit = req.body.limit ? parseInt(req.body.limit) : 3;
	const { _id, categorie } = req.body.product;
	// console.log(req.body)
	Product.find({ _id: { $ne: _id }, categorie: { $in: categorie } })
		.limit(limit)
		.populate('categories', '_id name slug')
		.select(
			'_id name slug excerpt photo cetegories pret pretRedus SKU inStoc cantitate sold ordine  createdAt updatedAt'
		)
		.exec((err, products) => {
			if (err) {
				return res.status(400).json({
					error: 'Produsele nu a putut fi gasit'
				});
			}
			res.json(products);
		});
};

//
exports.listSearch = (req, res) => {
	// console.log(req.query);
	const { search } = req.query;
	if (search) {
		Product.find(
			{
				$or: [
					{ name: { $regex: search, $options: 'i' } },
					{ SKU: { $regex: search, $options: 'i' } }
				]
			},
			(err, products) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				}
				res.json(products);
			}
		);
	}
};

exports.listBySearch = (req, res) => {
	let order = req.body.order ? req.body.order : 'desc';
	let ordine = req.body.ordine ? req.body.ordine : 'asc';
	let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
	let limit = req.body.limit ? parseInt(req.body.limit) : 100;
	let skip = parseInt(req.body.skip);
	let findArgs = {};

	// console.log(order, sortBy, limit, skip, req.body.filters);
	// console.log("findArgs", findArgs);

	for (let key in req.body.filters) {
		if (req.body.filters[key].length > 0) {
			if (key === 'pret') {
				// gte -  greater than price [0-10]
				// lte - less than
				findArgs[key] = {
					$gte: req.body.filters[key][0],
					$lte: req.body.filters[key][1]
				};
			} else {
				findArgs[key] = req.body.filters[key];
			}
		}
	}

	Product.find(findArgs)
		.populate('categories')
		.sort([[sortBy, ordine]])
		.skip(skip)
		.limit(limit)
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: 'Products not found'
				});
			}
			res.json({
				size: data.length,
				data
			});
		});
};
exports.listBySold = (req, res) => {
	let order = 'desc';
	let sortBy = 'sold';
	let limit = 4;

	Product.find()
		.populate('categories')
		.sort([[sortBy, order]])
		.limit(limit)
		.exec((err, products) => {
			if (err) {
				return res.status(400).json({
					error: 'Products not found'
				});
			}
			res.json(products);
		});
};

exports.decreaseQuantity = (req, res, next) => {
	let bulkOps = req.body.order.products.map(item => {
		return {
			updateOne: {
				filter: { _id: item._id },
				update: { $inc: { cantitate: -item.count, sold: +item.count } }
			}
		};
	});

	Product.bulkWrite(bulkOps, {}, (error, products) => {
		if (error) {
			return res.status(400).json({
				error: 'Could not update product'
			});
		}
		next();
	});
};
exports.productById = (req, res, next, id) => {
	Product.findById(id)
		.populate('categories')
		.exec((err, product) => {
			if (err || !product) {
				return res.status(400).json({
					error: 'Product not found'
				});
			}
			req.product = product;
			next();
		});
};
exports.listByNew = (req, res) => {
	let limit = 6;
	// let skip = req.body.skip ? parseInt(req.body.skip) : 0;
	Product.find({})
		.populate('categories', '_id name slug')
		.sort({ createdAt: -1 })
		.limit(limit)
		.select(
			'_id name slug excerpt mdesc photo cetegories pret pretRedus SKU inStoc cantitate sold ordine  createdAt updatedAt'
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
