const express = require('express');
const userController = require('../controllers/userController')
const router = express.Router()

//router.post('/signup', userController.signup)
router.post('/login', userController.login)

router.route('/signup').post(userController.signup)

module.exports = router