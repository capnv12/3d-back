const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
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

module.exports = mongoose.model('Tag', tagSchema);
