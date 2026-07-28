import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { patientAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { isAdmin, isReceptionist } = useAuth();
  const navigate = useNavigate();
  const limit = 10;

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getAll({ page, limit, search });
      setPatients(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try {
      await patientAPI.delete(id);
      toast.success('Patient deactivated');
      fetchPatients();
    } catch { toast.error('Failed to deactivate patient'); }
  };

  const bgColor = (bg) => {
    const map = { 'A+': 'bg-red-100 text-red-700', 'A-': 'bg-red-50 text-red-600', 'B+': 'bg-blue-100 text-blue-700', 'B-': 'bg-blue-50 text-blue-600', 'O+': 'bg-green-100 text-green-700', 'O-': 'bg-green-50 text-green-600', 'AB+': 'bg-purple-100 text-purple-700', 'AB-': 'bg-purple-50 text-purple-600' };
    return map[bg] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total patients</p>
        </div>
        <Link to="/patients/new" className="btn-primary">
          <PlusIcon className="w-5 h-5" /> Add Patient
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search by name, ID, phone..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Patient</th>
                <th className="table-header">ID</th>
                <th className="table-header">Age / Gender</th>
                <th className="table-header">Blood</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Registered</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No patients found</td></tr>
              ) : patients.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                        {p.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-gray-500">{p.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{p.patientId}</span></td>
                  <td className="table-cell">
                    {p.dateOfBirth ? `${new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} yrs` : '—'}
                    <span className="ml-1 text-gray-400">/ {p.gender}</span>
                  </td>
                  <td className="table-cell">
                    {p.bloodGroup ? <span className={`badge ${bgColor(p.bloodGroup)}`}>{p.bloodGroup}</span> : '—'}
                  </td>
                  <td className="table-cell">{p.phone}</td>
                  <td className="table-cell text-gray-500">{p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '—'}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/patients/${p._id}/edit`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {(isAdmin || isReceptionist) && (
                        <button onClick={() => handleDelete(p._id, `${p.firstName} ${p.lastName}`)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        {/* Pagination */}
        {total > limit && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Prev</button>
              <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
