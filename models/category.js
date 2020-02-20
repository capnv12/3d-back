const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			maxlength: 32,
			unique: true
		},
		photo: {
			data: Buffer,
			contentType: String
		},
		slug: {
			type: String,
			lowercase: true,
			index: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
