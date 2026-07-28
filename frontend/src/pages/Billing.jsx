import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { billingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const PAY_STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
  partial: 'bg-blue-100 text-blue-700', overdue: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700'
};

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const res = await billingAPI.getAll({ page, limit: 10, paymentStatus: statusFilter });
      setInvoices(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete invoice?')) return;
    try { await billingAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total invoices</p>
        </div>
        <Link to="/billing/new" className="btn-primary"><PlusIcon className="w-5 h-5" /> New Invoice</Link>
      </div>

      <div className="card p-4">
        <select className="input-field max-w-xs text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'partial', 'paid', 'overdue', 'cancelled'].map(s => <option key={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Invoice ID</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Balance</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
                : invoices.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No invoices found</td></tr>
                : invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="table-cell"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{inv.invoiceId}</span></td>
                    <td className="table-cell font-medium">{inv.patient?.firstName} {inv.patient?.lastName}</td>
                    <td className="table-cell font-semibold text-gray-900">${inv.totalAmount?.toLocaleString()}</td>
                    <td className="table-cell text-green-600">${inv.paidAmount?.toLocaleString()}</td>
                    <td className="table-cell text-red-600">${inv.balance?.toLocaleString()}</td>
                    <td className="table-cell">
                      <span className={`badge ${PAY_STATUS_STYLES[inv.paymentStatus]} capitalize`}>{inv.paymentStatus}</span>
                    </td>
                    <td className="table-cell text-gray-500">{inv.createdAt ? format(new Date(inv.createdAt), 'MMM d, yyyy') : '—'}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/billing/${inv._id}/edit`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                        {isAdmin && <button onClick={() => handleDelete(inv._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">{total} total</p>
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
