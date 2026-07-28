import { useState, useEffect } from 'react';
import { dashboardAPI, billingAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#059669', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [revenueSummary, setRevenueSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      billingAPI.getRevenueSummary()
    ]).then(([dashRes, revRes]) => {
      setStats(dashRes.data.data);
      setRevenueSummary(revRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  const revenueChartData = stats?.revenueByMonth?.map(item => ({
    month: new Date(2024, item._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: item.revenue
  })) || [];

  const statusChartData = stats?.appointmentsByStatus?.map(item => ({
    name: item._id, count: item.count
  })) || [];

  const revenuePieData = revenueSummary.map(item => ({
    name: item._id, value: item.total
  }));

  const summaryCards = [
    { label: 'Total Patients', value: stats?.stats.totalPatients, color: 'text-blue-600' },
    { label: 'Total Doctors', value: stats?.stats.totalDoctors, color: 'text-green-600' },
    { label: "Today's Appointments", value: stats?.stats.todayAppointments, color: 'text-purple-600' },
    { label: 'Monthly Revenue', value: `$${(stats?.stats.monthlyRevenue || 0).toLocaleString()}`, color: 'text-amber-600' },
    { label: 'Pending Bills', value: stats?.stats.pendingBills, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of hospital performance</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Status</h3>
          {revenuePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={revenuePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {revenuePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">No billing data</p>}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Appointment Completion Rate</span>
              <span className="text-sm font-bold text-green-600">
                {stats?.appointmentsByStatus ? 
                  `${Math.round((stats.appointmentsByStatus.find(a => a._id === 'completed')?.count || 0) / Math.max(stats.appointmentsByStatus.reduce((s, a) => s + a.count, 0), 1) * 100)}%` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Monthly Appointments</span>
              <span className="text-sm font-bold text-primary-600">{stats?.stats.monthlyAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Avg Revenue/Month</span>
              <span className="text-sm font-bold text-amber-600">
                ${revenueChartData.length > 0 ? Math.round(revenueChartData.reduce((s, d) => s + d.revenue, 0) / revenueChartData.length).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Pending Bills</span>
              <span className="text-sm font-bold text-red-600">{stats?.stats.pendingBills || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
