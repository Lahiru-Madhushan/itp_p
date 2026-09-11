
import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { API_ROOT } from "../../lib/api";

const cardIcons = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png', alt: 'Visa' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png', alt: 'MasterCard' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg', alt: 'Amex' },
];

const stripePromise = loadStripe('pk_test_12345'); // Replace with your real publishable key

const PayForm = ({ totalAmount, cart, navigate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setStatus('');
    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${API_ROOT}/payment/pay`, {
        amount: totalAmount,
        cart,
        paymentMethodId: paymentMethod.id,
      });
      if (response.data.success) {
        setShowSuccess(true);
        setStatus('');
      } else {
        setStatus('Payment failed.');
      }
    } catch (err) {
      setStatus('Error processing payment.');
    }
    setLoading(false);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-6">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#38c172" />
            <polyline points="30,55 45,70 70,35" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your payment was successful</h2>
        <p className="text-gray-600 mb-6 text-center">Thank you for your payment. We will be in contact with more details shortly.</p>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded text-lg font-semibold shadow"
          onClick={() => navigate('/transaction-history')}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <label className="block font-semibold mb-2">Card Details</label>
        <CardElement className="p-3 border rounded bg-gray-50" />
      </div>
      <div className="font-bold text-right text-lg mt-4">Total: Rs. {totalAmount}</div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded text-lg font-semibold mt-2"
        disabled={loading || !stripe}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {status && <div className="mt-4 text-center text-red-600">{status}</div>}
    </form>
  );
};

const Pay = () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border">
      <Elements stripe={stripePromise}>
        <PayForm totalAmount={totalAmount} cart={cart} navigate={navigate} />
      </Elements>
    </div>
  );
};

export default Pay;
