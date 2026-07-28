const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const MedicalRecord = require('../models/MedicalRecord');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPatients, totalDoctors, todayAppointments, monthlyAppointments,
      pendingBills, monthlyRevenue, recentPatients, upcomingAppointments,
      appointmentsByStatus, revenueByMonth
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ appointmentDate: { $gte: monthStart }, status: { $ne: 'cancelled' } }),
      Invoice.countDocuments({ paymentStatus: { $in: ['pending', 'overdue'] } }),
      Invoice.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Patient.find({ isActive: true }).sort('-createdAt').limit(5).select('firstName lastName patientId createdAt'),
      Appointment.find({ appointmentDate: { $gte: today }, status: { $in: ['scheduled', 'confirmed'] } })
        .populate('patient', 'firstName lastName')
        .populate({ path: 'doctor', select: 'firstName lastName specialization' })
        .sort('appointmentDate appointmentTime').limit(10),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Invoice.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          todayAppointments,
          monthlyAppointments,
          pendingBills,
          monthlyRevenue: monthlyRevenue[0]?.total || 0
        },
        recentPatients,
        upcomingAppointments,
        appointmentsByStatus,
        revenueByMonth: revenueByMonth.reverse()
      }
    });
  } catch (err) { next(err); }
};
