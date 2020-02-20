const express = require('express')
const router = express.Router()
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/auth')
const { read, update, userById, addOrderToUserHistory, purchaseHistory } = require('../controllers/user')


//validators
const { runValidation } = require('../validators/index')
const { userSignupValidator, userSigninValidator } = require('../validators/auth')


router.get('/profil/', requireSignin, authMiddleware, read);
router.put('/profil/actualizare', requireSignin, authMiddleware, adminMiddleware, update);

router.param('userId', userById)

module.exports = router