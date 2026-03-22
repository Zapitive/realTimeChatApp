const express = require('express');
const {signUp, login, refresh} = require('../controllers/authController');

const router = express.Router();

router.post('/register',signUp);
router.post('/login', login);
router.post('/refresh',refresh);

module.exports = router;