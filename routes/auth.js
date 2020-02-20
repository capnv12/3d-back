const express = require('express')
const router = express.Router()
const { signup, signin, signout, requireSignin, authMiddleware, preSignup, forgotPassword, resetPassword } = require('../controllers/auth')

//validators
const { runValidation } = require('../validators/index')
const { userSignupValidator, userSigninValidator,forgotPasswordValidator,resetPasswordValidator  } = require('../validators/auth')

// router.post('/pre-inregistrare', userSignupValidator, runValidation, preSignup);
router.post('/inregistrare', userSignupValidator, runValidation, signup);
router.post('/autentificare', userSigninValidator, runValidation, signin);
router.get('/dezautentificare', signout);
router.put('/recuperare-parola', forgotPasswordValidator, runValidation, forgotPassword)
router.put('/resetare-parola', resetPasswordValidator, runValidation, resetPassword)
module.exports = router