import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { billingAPI, patientAPI } from '../services/api';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, total: 0 });
  const isEdit = Boolean(id);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      tax: 0, discount: 0, paidAmount: 0, paymentStatus: 'pending'
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchItems = watch('items');
  const watchTax = watch('tax', 0);
  const watchDiscount = watch('discount', 0);

  useEffect(() => {
    const sub = watchItems?.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0) || 0;
    setTotals({ subtotal: sub, total: sub + Number(watchTax || 0) - Number(watchDiscount || 0) });
  }, [watchItems, watchTax, watchDiscount]);

  useEffect(() => {
    patientAPI.getAll({ limit: 200 }).then(res => setPatients(res.data.data));
    if (isEdit) billingAPI.getOne(id).then(res => reset({ ...res.data.data, patient: res.data.data.patient?._id }));
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      data.subtotal = totals.subtotal;
      data.totalAmount = totals.total;
      data.balance = totals.total - Number(data.paidAmount || 0);
      if (isEdit) await billingAPI.update(id, data);
      else await billingAPI.create(data);
      toast.success(`Invoice ${isEdit ? 'updated' : 'created'}`);
      navigate('/billing');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/billing')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeftIcon className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Patient Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Patient <span className="text-red-500">*</span></label>
              <select className="input-field" {...register('patient', { required: true })}>
                <option value="">Select patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input-field" {...register('dueDate')} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })} className="btn-secondary py-1.5 text-sm">
              <PlusIcon className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  {index === 0 && <label className="label text-xs">Description</label>}
                  <input className="input-field text-sm" placeholder="Service description" {...register(`items.${index}.description`, { required: true })} />
                </div>
                <div className="col-span-2">
                  {index === 0 && <label className="label text-xs">Qty</label>}
                  <input type="number" className="input-field text-sm" min={1} {...register(`items.${index}.quantity`, { min: 1 })} />
                </div>
                <div className="col-span-3">
                  {index === 0 && <label className="label text-xs">Unit Price ($)</label>}
                  <input type="number" className="input-field text-sm" min={0} step="0.01" {...register(`items.${index}.unitPrice`, { min: 0 })} />
                </div>
                <div className="col-span-2 flex items-end">
                  {index === 0 && <div className="label text-xs">&nbsp;</div>}
                  <button type="button" onClick={() => fields.length > 1 && remove(index)} disabled={fields.length <= 1} className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 w-full">
                    <TrashIcon className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Payment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Tax ($)</label>
              <input type="number" className="input-field" min={0} step="0.01" {...register('tax')} />
            </div>
            <div>
              <label className="label">Discount ($)</label>
              <input type="number" className="input-field" min={0} step="0.01" {...register('discount')} />
            </div>
            <div>
              <label className="label">Paid Amount ($)</label>
              <input type="number" className="input-field" min={0} step="0.01" {...register('paidAmount')} />
            </div>
            <div>
              <label className="label">Payment Status</label>
              <select className="input-field" {...register('paymentStatus')}>
                {['pending', 'partial', 'paid', 'overdue', 'cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>${totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg text-gray-900"><span>Total:</span><span>${totals.total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Update Invoice' : 'Create Invoice'}
          </button>
          <button type="button" onClick={() => navigate('/billing')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
