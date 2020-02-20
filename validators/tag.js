const { check } = require('express-validator');

exports.tagCreateValidator = [
	check('name')
		.not()
		.isEmpty()
		.withMessage('Numele este obligatoriu')
];
