import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { medicalRecordAPI } from '../services/api';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    medicalRecordAPI.getAll().then(res => setRecords(res.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records list */}
        <div className="lg:col-span-1 space-y-3">
          {records.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">
              <DocumentTextIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No records found</p>
            </div>
          ) : records.map(r => (
            <button key={r._id} onClick={() => setSelected(r)}
              className={`w-full text-left card hover:shadow-md transition-all ${selected?._id === r._id ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{r.patient?.firstName} {r.patient?.lastName}</p>
                  <p className="text-xs text-gray-500">Dr. {r.doctor?.firstName} {r.doctor?.lastName}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.visitDate ? format(new Date(r.visitDate), 'MMM d, yyyy') : '—'}</p>
                </div>
                <span className="ml-auto font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.recordId}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Record detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="card h-full min-h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Select a record to view details</p>
              </div>
            </div>
          ) : (
            <div className="card space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.patient?.firstName} {selected.patient?.lastName}</h2>
                  <p className="text-gray-500 text-sm">Visit: {selected.visitDate ? format(new Date(selected.visitDate), 'MMMM d, yyyy') : '—'}</p>
                </div>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{selected.recordId}</span>
              </div>

              {selected.chiefComplaint && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Chief Complaint</h3>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{selected.chiefComplaint}</p>
                </div>
              )}

              {selected.diagnosis?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Diagnosis</h3>
                  <div className="space-y-2">
                    {selected.diagnosis.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-900">{d.condition}</span>
                        {d.icdCode && <span className="font-mono text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{d.icdCode}</span>}
                        {d.severity && <span className={`badge text-xs ${d.severity === 'severe' ? 'bg-red-100 text-red-700' : d.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{d.severity}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.vitalSigns && Object.values(selected.vitalSigns).some(Boolean) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Vital Signs</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['BP', selected.vitalSigns.bloodPressure],
                      ['Heart Rate', selected.vitalSigns.heartRate && `${selected.vitalSigns.heartRate} bpm`],
                      ['Temp', selected.vitalSigns.temperature && `${selected.vitalSigns.temperature}°F`],
                      ['Weight', selected.vitalSigns.weight && `${selected.vitalSigns.weight} kg`],
                      ['Height', selected.vitalSigns.height && `${selected.vitalSigns.height} cm`],
                      ['SpO2', selected.vitalSigns.oxygenSaturation && `${selected.vitalSigns.oxygenSaturation}%`],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="font-semibold text-gray-900 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.prescriptions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Prescriptions</h3>
                  <div className="space-y-2">
                    {selected.prescriptions.map((p, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-blue-900">{p.medication} — {p.dosage}</p>
                        <p className="text-blue-700 text-xs">{p.frequency} for {p.duration} {p.instructions && `• ${p.instructions}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.notes}</p>
                </div>
              )}

              {selected.followUpDate && (
                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                  <strong>Follow-up:</strong> {format(new Date(selected.followUpDate), 'MMMM d, yyyy')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
