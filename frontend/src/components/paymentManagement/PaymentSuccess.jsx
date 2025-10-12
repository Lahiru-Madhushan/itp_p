import React, { useEffect, useState } from "react";
import { CheckCircle, Download } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8070";

export default function PaymentSuccess() {
  const [sessionId, setSessionId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionIdParam = params.get("session_id");
    const orderIdParam = params.get("order_id");
    
    setSessionId(sessionIdParam);
    setOrderId(orderIdParam);
    
    // Fetch order details
    if (sessionIdParam || orderIdParam) {
      fetchOrderDetails(sessionIdParam, orderIdParam);
    }
  }, []);

  const fetchOrderDetails = async (sessionId, orderId) => {
    try {
      const response = await axios.get(`${API}/api/payments/success`, {
        params: {
          session_id: sessionId,
          order_id: orderId
        }
      });
      
      if (response.data.success) {
        setOrderData(response.data.order);
        // Auto-attempt to download invoice after a short delay
        setTimeout(() => {
          downloadInvoice();
        }, 2000); // Wait 2 seconds for invoice generation
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const downloadInvoice = async () => {
    if (!orderData) return;
    
    setDownloadingInvoice(true);
    try {
      // Get the payment record to get transaction ID
      const paymentResponse = await axios.get(`${API}/api/payments/all`);
      const payments = paymentResponse.data.payments || [];
      
      // Find the payment for this order
      const payment = payments.find(p => p.orderId === orderData._id);
      
      if (payment && payment.transactionId) {
        const response = await axios.get(`${API}/api/payments/invoice/${payment.transactionId}`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${payment.transactionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        setInvoiceDownloaded(true);
      } else {
        alert("Invoice not available yet. Please try again in a moment.");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-lg">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-green-700 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your transaction was completed.
        </p>
        <p className="text-sm text-blue-600 mb-4">
          📄 Your invoice will be automatically downloaded in a moment...
        </p>
        
        {orderData && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Order Summary:</h3>
            <p className="text-sm text-gray-600">
              <strong>Order ID:</strong> {orderData.orderId || orderData._id}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Total Items:</strong> {orderData.items?.length || 0}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Total Amount:</strong> Rs. {orderData.total || 0}
            </p>
            {orderData.userId && (
              <p className="text-sm text-gray-600">
                <strong>Customer:</strong> {orderData.userId.firstName} {orderData.userId.lastName}
              </p>
            )}
          </div>
        )}
        
        {sessionId && (
          <p className="text-sm text-gray-500 mb-4">Session ID: {sessionId}</p>
        )}
        
        <div className="flex flex-col gap-3">
          <button
            onClick={downloadInvoice}
            disabled={downloadingInvoice || invoiceDownloaded}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              invoiceDownloaded 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : downloadingInvoice
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Download className="w-5 h-5" />
            {downloadingInvoice 
              ? 'Generating Invoice...' 
              : invoiceDownloaded 
              ? 'Invoice Downloaded ✓' 
              : 'Download Invoice'
            }
          </button>
          
          <a
            href="/"
            className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Shop
          </a>
        </div>
      </div>
    </div>
  );
}
