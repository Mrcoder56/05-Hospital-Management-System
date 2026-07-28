const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

console.log("Current directory:", process.cwd());
console.log("dotenv result:", dotenv.config());
console.log("MONGO_URI:", process.env.MONGO_URI);

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/medical-records', require('./routes/medicalRecords'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Hospital API running' }));
const User = require("./models/User");

app.get("/test-user", async (req, res) => {
  const user = await User.findOne({ email: "admin@hospital.com" }).select("+password");
  res.json(user);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏥 Hospital API running on port ${PORT}`));

module.exports = app;

