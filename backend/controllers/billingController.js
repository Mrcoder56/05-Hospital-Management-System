const Invoice = require('../models/Invoice');

exports.getInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, paymentStatus, patientId } = req.query;
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (patientId) query.patient = patientId;

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('appointment', 'appointmentDate appointmentTime')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, count: invoices.length, total, data: invoices });
  } catch (err) { next(err); }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient')
      .populate('appointment')
      .populate('createdBy', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const subtotal = req.body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    req.body.subtotal = subtotal;
    req.body.totalAmount = subtotal + (req.body.tax || 0) - (req.body.discount || 0);
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    if (req.body.items) {
      const subtotal = req.body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      req.body.subtotal = subtotal;
      req.body.totalAmount = subtotal + (req.body.tax || 0) - (req.body.discount || 0);
    }
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

exports.getRevenueSummary = async (req, res, next) => {
  try {
    const summary = await Invoice.aggregate([
      { $group: {
        _id: '$paymentStatus',
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }}
    ]);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
};
