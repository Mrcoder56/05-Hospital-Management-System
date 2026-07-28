const Doctor = require('../models/Doctor');
const User = require('../models/User');

exports.getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, department } = req.query;
    const query = { isActive: true };
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (department) query.department = new RegExp(department, 'i');
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { doctorId: new RegExp(search, 'i') }
      ];
    }
    const doctors = await Doctor.find(query).populate('user', 'name email');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) { next(err); }
};

exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { email, password, name, ...doctorData } = req.body;
    const user = await User.create({ name: `${doctorData.firstName} ${doctorData.lastName}`, email, password, role: 'doctor' });
    const doctor = await Doctor.create({ ...doctorData, user: user._id });
    await User.findByIdAndUpdate(user._id, { doctorProfile: doctor._id });
    res.status(201).json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) { next(err); }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor deactivated' });
  } catch (err) { next(err); }
};
