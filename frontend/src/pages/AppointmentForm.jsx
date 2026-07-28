import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { appointmentAPI, patientAPI, doctorAPI } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AppointmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const isEdit = Boolean(id);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    Promise.all([
      patientAPI.getAll({ limit: 200 }),
      doctorAPI.getAll()
    ]).then(([pRes, dRes]) => {
      setPatients(pRes.data.data);
      setDoctors(dRes.data.data);
    });
    if (isEdit) {
      appointmentAPI.getOne(id).then(res => {
        const a = res.data.data;
        reset({ ...a, patient: a.patient?._id, doctor: a.doctor?._id, appointmentDate: a.appointmentDate?.split('T')[0] });
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) await appointmentAPI.update(id, data);
      else await appointmentAPI.create(data);
      toast.success(`Appointment ${isEdit ? 'updated' : 'booked'}`);
      navigate('/appointments');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const times = [];
  for (let h = 8; h <= 18; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 18) times.push(`${String(h).padStart(2, '0')}:30`);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/appointments')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeftIcon className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Appointment' : 'Book Appointment'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div>
          <label className="label">Patient <span className="text-red-500">*</span></label>
          <select className="input-field" {...register('patient', { required: 'Patient is required' })}>
            <option value="">Select patient</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
          </select>
          {errors.patient && <p className="text-red-500 text-xs mt-1">{errors.patient.message}</p>}
        </div>

        <div>
          <label className="label">Doctor <span className="text-red-500">*</span></label>
          <select className="input-field" {...register('doctor', { required: 'Doctor is required' })}>
            <option value="">Select doctor</option>
            {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName} - {d.specialization}</option>)}
          </select>
          {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date <span className="text-red-500">*</span></label>
            <input type="date" className="input-field" {...register('appointmentDate', { required: 'Date required' })} />
            {errors.appointmentDate && <p className="text-red-500 text-xs mt-1">{errors.appointmentDate.message}</p>}
          </div>
          <div>
            <label className="label">Time <span className="text-red-500">*</span></label>
            <select className="input-field" {...register('appointmentTime', { required: 'Time required' })}>
              <option value="">Select time</option>
              {times.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Appointment Type</label>
            <select className="input-field" {...register('type')}>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="routine-checkup">Routine Checkup</option>
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="label">Status</label>
              <select className="input-field" {...register('status')}>
                {['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="label">Symptoms / Notes</label>
          <textarea className="input-field" rows={3} {...register('symptoms')} placeholder="Describe symptoms or reason for visit..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Update Appointment' : 'Book Appointment'}
          </button>
          <button type="button" onClick={() => navigate('/appointments')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
