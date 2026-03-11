const express = require('express');
const {signUp} = require('../controllers/authController')

const router = express.Router();

router.post('/register',signUp)
router.post('/login',()=>{})

module.exports = router