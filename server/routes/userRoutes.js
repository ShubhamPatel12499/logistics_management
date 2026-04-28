const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, userController.getAllUsers);
router.put('/:id/status', authenticateToken, requireAdmin, userController.updateUserStatus);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;
