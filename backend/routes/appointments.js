const express = require('express');
const router = express.Router();
const { getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, getTodayAppointments } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/today', getTodayAppointments);
router.route('/').get(getAppointments).post(createAppointment);
router.route('/:id').get(getAppointment).put(updateAppointment).delete(authorize('admin', 'receptionist'), deleteAppointment);

module.exports = router;
