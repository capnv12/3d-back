const { check } = require('express-validator')

exports.userSignupValidator = [
    check('email')
        .isEmail()
        .withMessage('Adresa de email trebuie sa fie una valida'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Parola trebuie sa fie de cel putin 6 caractere'),
]
exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Adresa de email trebuie sa fie una valida'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Parola trebuie sa fie de cel putin 6 caractere'),
]

exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Adresa de email trebuie sa fie una valida')
];

exports.resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage('Parola trebuie sa fie de cel putin 6 caractere')
];