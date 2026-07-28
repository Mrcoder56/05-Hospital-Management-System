import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doctorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const res = await doctorAPI.getAll({ search });
      setDoctors(res.data.data);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, [search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try {
      await doctorAPI.delete(id);
      toast.success('Doctor deactivated');
      fetchDoctors();
    } catch { toast.error('Failed'); }
  };

  const deptColors = { Cardiology: 'bg-red-100 text-red-700', Neurology: 'bg-purple-100 text-purple-700', Orthopedics: 'bg-amber-100 text-amber-700', Pediatrics: 'bg-pink-100 text-pink-700', Surgery: 'bg-blue-100 text-blue-700' };
  const getDeptColor = (dept) => deptColors[dept] || 'bg-gray-100 text-gray-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">{doctors.length} registered doctors</p>
        </div>
        {isAdmin && <Link to="/doctors/new" className="btn-primary"><PlusIcon className="w-5 h-5" /> Add Doctor</Link>}
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map(doc => (
            <div key={doc._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {doc.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {doc.firstName} {doc.lastName}</h3>
                    <p className="text-sm text-gray-500">{doc.specialization}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/doctors/${doc._id}/edit`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(doc._id, `Dr. ${doc.firstName}`)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className={`badge ${getDeptColor(doc.department)}`}>{doc.department}</span>
                  <span className="text-gray-500">{doc.experience} yrs exp</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Consultation: <strong className="text-gray-900">${doc.consultationFee}</strong></span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{doc.doctorId}</span>
                </div>
                {doc.qualification?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.qualification.map(q => (
                      <span key={q} className="badge bg-gray-100 text-gray-600 text-xs">{q}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {doctors.length === 0 && <p className="col-span-3 text-center text-gray-400 py-12">No doctors found</p>}
        </div>
      )}
    </div>
  );
}
