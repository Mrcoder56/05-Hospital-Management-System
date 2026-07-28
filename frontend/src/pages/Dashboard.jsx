import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  UserGroupIcon, UserIcon, CalendarIcon, CreditCardIcon,
  ArrowTrendingUpIcon, ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const STATUS_COLORS = {
  scheduled: '#3b82f6', confirmed: '#059669', completed: '#6b7280',
  cancelled: '#ef4444', 'in-progress': '#f59e0b', 'no-show': '#9ca3af'
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    dashboardAPI.getStats().then(res => setStats(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  const statCards = [
    { label: 'Total Patients', value: stats?.stats.totalPatients, icon: UserGroupIcon, color: 'bg-blue-50 text-blue-600', link: '/patients' },
    { label: 'Doctors', value: stats?.stats.totalDoctors, icon: UserIcon, color: 'bg-green-50 text-green-600', link: '/doctors' },
    { label: "Today's Appointments", value: stats?.stats.todayAppointments, icon: CalendarIcon, color: 'bg-purple-50 text-purple-600', link: '/appointments' },
    { label: 'Monthly Revenue', value: `$${(stats?.stats.monthlyRevenue || 0).toLocaleString()}`, icon: ArrowTrendingUpIcon, color: 'bg-amber-50 text-amber-600', link: '/billing' },
  ];

  const chartData = stats?.revenueByMonth?.map(item => ({
    month: new Date(2024, item._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: item.revenue
  })) || [];

  const pieData = stats?.appointmentsByStatus?.map(item => ({
    name: item._id, value: item.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">No data yet</p>}
        </div>

        {/* Appointment status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">No data yet</p>}
        </div>
      </div>

      {/* Recent data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
            <Link to="/patients" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentPatients?.length ? stats.recentPatients.map(patient => (
              <div key={patient._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {patient.firstName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-gray-500">{patient.patientId}</p>
                </div>
                <p className="text-xs text-gray-400">{format(new Date(patient.createdAt), 'MMM d')}</p>
              </div>
            )) : <p className="text-gray-400 text-sm">No recent patients</p>}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
            <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.upcomingAppointments?.length ? stats.upcomingAppointments.slice(0, 5).map(apt => (
              <div key={apt._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                  <p className="text-xs text-gray-500">{apt.doctor?.firstName} {apt.doctor?.lastName} • {apt.doctor?.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-700">{apt.appointmentTime}</p>
                  <p className="text-xs text-gray-400">{format(new Date(apt.appointmentDate), 'MMM d')}</p>
                </div>
              </div>
            )) : <p className="text-gray-400 text-sm">No upcoming appointments</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
