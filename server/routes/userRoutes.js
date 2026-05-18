const express = require('express');
const {authenticateToken} = require('../middlewares/authMiddleware');
const {searchUser} = require('../controllers/userController')
const router = express.Router();

router.get('/searchUser',authenticateToken, searchUser);

module.exports = router;