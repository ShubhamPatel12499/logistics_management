const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/stats', authenticateToken, logisticsController.getDashboardStats);
router.get('/categories', authenticateToken, logisticsController.getCategories);
router.post('/categories', authenticateToken, requireAdmin, logisticsController.addCategory);
router.get('/events', authenticateToken, logisticsController.getEvents);
router.post('/events', authenticateToken, logisticsController.addEvent);
router.delete('/events/:id', authenticateToken, requireAdmin, logisticsController.deleteEvent);
router.get('/', authenticateToken, logisticsController.getAllItems);
router.post('/', authenticateToken, logisticsController.createItem);
router.put('/:id', authenticateToken, logisticsController.updateItem);
router.delete('/:id', authenticateToken, requireAdmin, logisticsController.deleteItem);

router.post('/:id/assign', authenticateToken, requireAdmin, logisticsController.assignItem);
router.post('/:id/unassign', authenticateToken, requireAdmin, logisticsController.unassignItem);
router.get('/:id/history', authenticateToken, logisticsController.getHistory);

router.post('/:id/transfer', authenticateToken, logisticsController.requestTransfer);
router.get('/transfers/pending', authenticateToken, logisticsController.getPendingRequests);
router.post('/transfer/:requestId/accept', authenticateToken, logisticsController.acceptTransfer);
router.post('/transfer/:requestId/reject', authenticateToken, logisticsController.rejectTransfer);

module.exports = router;
