const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, date, doctorId, patientId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: start, $lte: end };
    }
    // If doctor role, only show their appointments
    if (req.user.role === 'doctor' && req.user.doctorProfile) {
      query.doctor = req.user.doctorProfile;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName patientId phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ appointmentDate: -1, appointmentTime: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, count: appointments.length, total, data: appointments });
  } catch (err) { next(err); }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (err) { next(err); }
};

exports.createAppointment = async (req, res, next) => {
  try {
    req.body.bookedBy = req.user.id;
    const appt = await Appointment.create(req.body);
    await appt.populate('patient', 'firstName lastName');
    res.status(201).json({ success: true, data: appt });
  } catch (err) { next(err); }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (err) { next(err); }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) { next(err); }
};

exports.getTodayAppointments = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const appointments = await Appointment.find({ appointmentDate: { $gte: start, $lte: end } })
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', select: 'firstName lastName specialization' })
      .sort('appointmentTime');
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) { next(err); }
};
