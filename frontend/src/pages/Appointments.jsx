import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const STATUS_STYLES = {
  scheduled: 'bg-blue-100 text-blue-700', confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700',
  'in-progress': 'bg-amber-100 text-amber-700', 'no-show': 'bg-orange-100 text-orange-700'
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { isAdmin, isReceptionist } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await appointmentAPI.getAll(params);
      setAppointments(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, [page, statusFilter, dateFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete appointment?')) return;
    try { await appointmentAPI.delete(id); toast.success('Deleted'); fetchAppointments(); }
    catch { toast.error('Failed'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await appointmentAPI.update(id, { status }); toast.success('Status updated'); fetchAppointments(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total appointments</p>
        </div>
        <Link to="/appointments/new" className="btn-primary"><PlusIcon className="w-5 h-5" /> Book Appointment</Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4">
        <div>
          <label className="label text-xs">Status</label>
          <select className="input-field py-1.5 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">Date</label>
          <input type="date" className="input-field py-1.5 text-sm" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        {(statusFilter || dateFilter) && (
          <div className="flex items-end">
            <button onClick={() => { setStatusFilter(''); setDateFilter(''); }} className="btn-secondary py-1.5 text-sm">Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Appointment ID</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Doctor</th>
                <th className="table-header">Date & Time</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
                : appointments.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No appointments found</td></tr>
                : appointments.map(apt => (
                  <tr key={apt._id} className="hover:bg-gray-50">
                    <td className="table-cell"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{apt.appointmentId}</span></td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                        <p className="text-xs text-gray-500">{apt.patient?.patientId}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</p>
                        <p className="text-xs text-gray-500">{apt.doctor?.specialization}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">{apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM d, yyyy') : '—'}</p>
                        <p className="text-xs text-gray-500">{apt.appointmentTime}</p>
                      </div>
                    </td>
                    <td className="table-cell capitalize">{apt.type?.replace('-', ' ')}</td>
                    <td className="table-cell">
                      <select
                        className={`badge ${STATUS_STYLES[apt.status]} border-0 cursor-pointer text-xs font-medium`}
                        value={apt.status}
                        onChange={e => handleStatusUpdate(apt._id, e.target.value)}
                      >
                        {['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/appointments/${apt._id}/edit`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {(isAdmin || isReceptionist) && (
                          <button onClick={() => handleDelete(apt._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Prev</button>
              <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
