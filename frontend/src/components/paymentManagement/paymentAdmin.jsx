import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ROOT } from "../../lib/api";

const API = API_ROOT;

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState({
    phoneNumber: '',
    documentType: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`${API}/api/payments/all`);
        console.log("Payments API response:", res.data);
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
        console.error("Error details:", err.response?.data);
        setError(err.response?.data?.message || "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <p className="p-6">Loading payment history...</p>;

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  console.log("Current payments state:", payments);

  const testDatabase = async () => {
    try {
      const res = await axios.get(`${API}/api/payments/test-db`);
      console.log("Database test result:", res.data);
      alert(`Database test: ${res.data.success ? 'SUCCESS' : 'FAILED'}\n${JSON.stringify(res.data, null, 2)}`);
    } catch (err) {
      console.error("Database test failed:", err);
      alert("Database test failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!documentData.phoneNumber || !documentData.documentType || !documentData.file) {
      alert("Please fill in all required fields and select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('phoneNumber', documentData.phoneNumber);
      formData.append('documentType', documentData.documentType);
      formData.append('description', documentData.description);
      formData.append('document', documentData.file);

      const res = await axios.post(`${API}/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        alert('Document saved successfully!');
        setShowDocumentModal(false);
        setDocumentData({
          phoneNumber: '',
          documentType: '',
          description: '',
          file: null
        });
      } else {
        throw new Error(res.data.message || 'Failed to save document');
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Failed to save document: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setDocumentData(prev => ({ ...prev, file }));
    }
  };

  const fetchDocuments = async (phoneNumber) => {
    try {
      const res = await axios.get(`${API}/api/documents/phone/${phoneNumber}`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      alert("Failed to fetch documents: " + (err.response?.data?.message || err.message));
    }
  };

  const downloadPaymentHistoryPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await axios.get(`${API}/api/payments/history/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payment_history_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading payment history:", err);
      alert("Failed to download payment history PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <div className="flex gap-2">
          <button 
            onClick={downloadPaymentHistoryPDF}
            disabled={downloadingPDF}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {downloadingPDF ? 'Generating PDF...' : 'Download Payment History PDF'}
          </button>
          <button 
            onClick={() => setShowDocumentModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            Upload Document
          </button>
          <button 
            onClick={() => setShowDocuments(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            View Documents
          </button>
          <button 
            onClick={testDatabase}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Test Database
          </button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Transaction ID</th>
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Method</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border text-sm">{p.transactionId}</td>
                  <td className="px-4 py-2 border text-sm">
                    {p.userId?.firstName && p.userId?.lastName 
                      ? `${p.userId.firstName} ${p.userId.lastName}` 
                      : p.userId?.firstName || "Unknown"} <br />
                    <span className="text-gray-500">{p.userId?.email}</span>
                  </td>
                  <td className="px-4 py-2 border font-medium">
                    Rs. {p.amount}
                  </td>
                  <td className="px-4 py-2 border">{p.paymentMethod}</td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      p.status === "Completed"
                        ? "text-green-600"
                        : p.status === "Failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {p.status}
                  </td>
                  <td className="px-4 py-2 border text-sm">
                    {new Date(p.paymentDate).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Upload Document</h3>
            <form onSubmit={handleDocumentUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={documentData.phoneNumber}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={documentData.documentType}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select document type</option>
                  <option value="invoice">Invoice</option>
                  <option value="receipt">Receipt</option>
                  <option value="contract">Contract</option>
                  <option value="identity">Identity Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={documentData.description}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter document description"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Viewer Modal */}
      {showDocuments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Document Viewer</h3>
              <button
                onClick={() => setShowDocuments(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number to search documents"
                />
                <button
                  onClick={() => fetchDocuments(searchPhone)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Search
                </button>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchPhone ? 'No documents found for this phone number' : 'Enter a phone number to search for documents'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">Phone Number</th>
                      <th className="px-4 py-2 border">Document Type</th>
                      <th className="px-4 py-2 border">File Name</th>
                      <th className="px-4 py-2 border">Description</th>
                      <th className="px-4 py-2 border">Uploaded</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border text-sm">{doc.phoneNumber}</td>
                        <td className="px-4 py-2 border text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {doc.documentType}
                          </span>
                        </td>
                        <td className="px-4 py-2 border text-sm">{doc.fileName}</td>
                        <td className="px-4 py-2 border text-sm">{doc.description || '-'}</td>
                        <td className="px-4 py-2 border text-sm">
                          {new Date(doc.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border text-sm">
                          <button
                            onClick={() => downloadDocument(doc._id, doc.fileName)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}