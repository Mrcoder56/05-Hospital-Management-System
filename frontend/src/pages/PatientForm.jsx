import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { patientAPI } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEdit) {
      patientAPI.getOne(id).then(res => {
        const p = res.data.data;
        reset({ ...p, dateOfBirth: p.dateOfBirth?.split('T')[0] });
      }).catch(() => toast.error('Failed to load patient'));
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) await patientAPI.update(id, data);
      else await patientAPI.create(data);
      toast.success(`Patient ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/patients');
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  const Field = ({ name, label, required, type = 'text', options, ...rest }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {options ? (
        <select className="input-field" {...register(name, required ? { required: `${label} is required` } : {})} {...rest}>
          <option value="">Select {label}</option>
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input type={type} className="input-field" {...register(name, required ? { required: `${label} is required` } : {})} {...rest} />
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/patients')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Patient' : 'Add New Patient'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="firstName" label="First Name" required />
            <Field name="lastName" label="Last Name" required />
            <Field name="dateOfBirth" label="Date of Birth" required type="date" />
            <Field name="gender" label="Gender" required options={['male', 'female', 'other']} />
            <Field name="bloodGroup" label="Blood Group" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
            <Field name="phone" label="Phone" required placeholder="+1-555-0000" />
            <Field name="email" label="Email" type="email" placeholder="patient@email.com" />
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Street</label>
              <input className="input-field" {...register('address.street')} placeholder="123 Main St" />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input-field" {...register('address.city')} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input-field" {...register('address.state')} />
            </div>
            <div>
              <label className="label">Zip Code</label>
              <input className="input-field" {...register('address.zipCode')} />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input className="input-field" {...register('emergencyContact.name')} />
            </div>
            <div>
              <label className="label">Relationship</label>
              <input className="input-field" {...register('emergencyContact.relationship')} placeholder="e.g. Spouse" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" {...register('emergencyContact.phone')} />
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Insurance & Medical</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Insurance Provider</label>
              <input className="input-field" {...register('insuranceProvider')} />
            </div>
            <div>
              <label className="label">Insurance Number</label>
              <input className="input-field" {...register('insuranceNumber')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Update Patient' : 'Create Patient'}
          </button>
          <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
