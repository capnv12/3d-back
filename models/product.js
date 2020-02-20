const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 36
		},
		slug: {
			type: String,
			unique: true,
			index: true
		},
		mtitle: {
			type: String
		},
		mdesc: {
			type: String
		},
		excerpt: {
			type: String,
			max: 1000
		},
		descriere: {
			type: String,
			trim: true,
			maxlength: 2000000
		},
		categories: [{ type: ObjectId, ref: 'Category', required: true }],
		pret: {
			type: Number,
			trim: true,
			maxlength: 32
		},
		pretRedus: {
			type: Number,
			trim: true,
			maxlength: 32
		},
		SKU: {
			type: String,
			trim: true,
			maxlength: 32
		},
		inStoc: {
			type: Number,
			min: 0,
			max: 1
		},
		cantitate: {
			type: Number,
			trim: true,
			maxlength: 32
		},
		photo: [
			{
				type: Object
				// required: true
			}
		],
		photo1: {
			data: Buffer,
			content: String
		},
		photo2: {
			data: Buffer,
			content: String
		},
		photo3: {
			data: Buffer,
			content: String
		},
		sold: {
			type: Number
		},
		ordine: {
			type: Number,
			default: 0
		}

		// rating: {
		// 	type: Number,
		// 	default: 0,
		// 	min: 0,
		// 	max: 5
		// }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
