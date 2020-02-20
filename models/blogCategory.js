const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
			unique: true
		},
		slug: {
			type: String,
			lowercase: true,
			index: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
