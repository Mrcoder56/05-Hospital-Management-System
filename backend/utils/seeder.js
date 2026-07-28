const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

dotenv.config();

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@hospital.com',
    password: 'admin123', role: 'admin'
  });

  // Create receptionist
  await User.create({
    name: 'Jane Reception', email: 'reception@hospital.com',
    password: 'reception123', role: 'receptionist'
  });

  // Create doctors
  const doctorUser1 = await User.create({
    name: 'Dr. Sarah Johnson', email: 'sarah@hospital.com',
    password: 'doctor123', role: 'doctor'
  });

  const doctor1 = await Doctor.create({
    user: doctorUser1._id, firstName: 'Sarah', lastName: 'Johnson',
    specialization: 'Cardiology', department: 'Cardiology',
    qualification: ['MD', 'PhD Cardiology'], experience: 12,
    consultationFee: 150, phone: '+1-555-0101',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '13:00' }
    ]
  });

  await User.findByIdAndUpdate(doctorUser1._id, { doctorProfile: doctor1._id });

  const doctorUser2 = await User.create({
    name: 'Dr. Michael Chen', email: 'michael@hospital.com',
    password: 'doctor123', role: 'doctor'
  });

  const doctor2 = await Doctor.create({
    user: doctorUser2._id, firstName: 'Michael', lastName: 'Chen',
    specialization: 'Neurology', department: 'Neurology',
    qualification: ['MD', 'FRCP Neurology'], experience: 8,
    consultationFee: 180, phone: '+1-555-0102',
    availability: [
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' }
    ]
  });

  await User.findByIdAndUpdate(doctorUser2._id, { doctorProfile: doctor2._id });

  // Create sample patients
  const patients = [
    { firstName: 'John', lastName: 'Doe', dateOfBirth: new Date('1985-03-15'), gender: 'male', bloodGroup: 'O+', phone: '+1-555-1001', email: 'john.doe@email.com', address: { city: 'New York', state: 'NY' }, registeredBy: admin._id },
    { firstName: 'Emily', lastName: 'Smith', dateOfBirth: new Date('1990-07-22'), gender: 'female', bloodGroup: 'A+', phone: '+1-555-1002', email: 'emily.smith@email.com', address: { city: 'Los Angeles', state: 'CA' }, registeredBy: admin._id },
    { firstName: 'Robert', lastName: 'Brown', dateOfBirth: new Date('1978-11-08'), gender: 'male', bloodGroup: 'B-', phone: '+1-555-1003', address: { city: 'Chicago', state: 'IL' }, registeredBy: admin._id },
  ];

 for (const patient of patients) {
  await Patient.create(patient);
}

  console.log('✅ Seed data inserted successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@hospital.com / admin123');
  console.log('Reception: reception@hospital.com / reception123');
  console.log('Doctor: sarah@hospital.com / doctor123');
  console.log('Doctor: michael@hospital.com / doctor123');

  process.exit(0);
};

seedData().catch(err => { console.error(err); process.exit(1); });
