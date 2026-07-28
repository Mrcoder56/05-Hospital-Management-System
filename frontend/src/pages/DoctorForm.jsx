import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { doctorAPI } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Surgery', 'Gynecology', 'Dermatology', 'Psychiatry', 'Radiology', 'Emergency', 'General Medicine'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEdit) {
      doctorAPI.getOne(id).then(res => reset(res.data.data)).catch(() => toast.error('Failed to load'));
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.qualification) data.qualification = data.qualification.split(',').map(q => q.trim()).filter(Boolean);
      if (isEdit) await doctorAPI.update(id, data);
      else await doctorAPI.create(data);
      toast.success(`Doctor ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/doctors');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/doctors')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeftIcon className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Doctor' : 'Add New Doctor'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!isEdit && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Account Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email <span className="text-red-500">*</span></label>
                <input className="input-field" type="email" {...register('email', { required: true })} />
              </div>
              <div>
                <label className="label">Password <span className="text-red-500">*</span></label>
                <input className="input-field" type="password" {...register('password', { required: true, minLength: 6 })} />
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Personal & Professional Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name <span className="text-red-500">*</span></label>
              <input className="input-field" {...register('firstName', { required: true })} />
            </div>
            <div>
              <label className="label">Last Name <span className="text-red-500">*</span></label>
              <input className="input-field" {...register('lastName', { required: true })} />
            </div>
            <div>
              <label className="label">Specialization <span className="text-red-500">*</span></label>
              <input className="input-field" {...register('specialization', { required: true })} placeholder="e.g. Interventional Cardiology" />
            </div>
            <div>
              <label className="label">Department <span className="text-red-500">*</span></label>
              <select className="input-field" {...register('department', { required: true })}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input className="input-field" type="number" {...register('experience')} />
            </div>
            <div>
              <label className="label">Consultation Fee ($)</label>
              <input className="input-field" type="number" {...register('consultationFee')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" {...register('phone')} />
            </div>
            <div>
              <label className="label">Qualifications (comma-separated)</label>
              <input className="input-field" {...register('qualification')} placeholder="MD, PhD, FRCP" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea className="input-field" rows={3} {...register('bio')} placeholder="Doctor's professional bio..." />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Update Doctor' : 'Create Doctor'}
          </button>
          <button type="button" onClick={() => navigate('/doctors')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
