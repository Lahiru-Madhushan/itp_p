import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import Pay from '../paymentManagement/pay';
import TransactionHistory from '../paymentManagement/transaction';
import { API_ROOT } from "../../lib/api";

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ amount: '', type: '', date: '', status: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/api/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ROOT}/api/transactions`, form);
      setForm({ amount: '', type: '', date: '', status: '' });
      fetchTransactions();
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_ROOT}/api/transactions/${id}`, form);
      setEditingId(null);
      setForm({ amount: '', type: '', date: '', status: '' });
      fetchTransactions();
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_ROOT}/api/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const startEdit = (txn) => {
    setEditingId(txn._id);
    setForm({ amount: txn.amount, type: txn.type, date: txn.date, status: txn.status });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <form onSubmit={editingId ? () => handleUpdate(editingId) : handleCreate} className="space-y-2 mb-6">
        <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded" required />
        <input type="date" placeholder="Date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2 border rounded" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'} Transaction</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ amount: '', type: '', date: '', status: '' }); }} className="ml-2 px-4 py-2 rounded border">Cancel</button>}
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn._id}>
              <td className="p-2 border">{txn.amount}</td>
              <td className="p-2 border">{txn.type}</td>
              <td className="p-2 border">{txn.date}</td>
              <td className="p-2 border">{txn.status}</td>
              <td className="p-2 border">
                <button onClick={() => startEdit(txn)} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(txn._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistoryPage;
