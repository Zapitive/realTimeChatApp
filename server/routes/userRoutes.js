const express = require('express');
const {authenticateToken} = require('../middlewares/authMiddleware');
const {allUsers, searchUser} = require('../controllers/userController')
const router = express.Router();

router.get('/allUsers',authenticateToken,allUsers);
router.get('/searchUser',authenticateToken, searchUser);

module.exports = router;