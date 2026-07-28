const MedicalRecord = require('../models/MedicalRecord');

exports.getMedicalRecords = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.query;
    const query = {};
    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;
    if (req.user.role === 'doctor' && req.user.doctorProfile) query.doctor = req.user.doctorProfile;

    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', select: 'firstName lastName specialization' })
      .sort('-visitDate');

    res.json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

exports.getMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('appointment');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.createMedicalRecord = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const record = await MedicalRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.deleteMedicalRecord = async (req, res, next) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) { next(err); }
};
