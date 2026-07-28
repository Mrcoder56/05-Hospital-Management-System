const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getRevenueSummary } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/revenue-summary', getRevenueSummary);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').get(getInvoice).put(updateInvoice).delete(authorize('admin'), deleteInvoice);

module.exports = router;
