import React, { useState, useEffect } from 'react';
import { getRepairOrders, createPayment } from '../services/api';
import toast from 'react-hot-toast';

const PaymentSimulation = () => {
  const [repairOrders, setRepairOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadCompletedOrders(); }, []);

  const loadCompletedOrders = async () => {
    const response = await getRepairOrders();
    setRepairOrders(response.data.filter(order => order.status === 'COMPLETED'));
  };

  const handlePayment = async () => {
    if (!selectedOrder) { 
      toast.error('Please select a repair order'); 
      return; 
    }
    alert(parseFloat(paymentAmount) + " ffffff  " + selectedOrder.total_amount)
    if (parseFloat(paymentAmount) != selectedOrder.total_amount) {
      toast.error(`Payment amount must equal $${selectedOrder.total_amount}`);
      return;
    }
    
    setProcessing(true);
    try {
      await createPayment({ 
        repair_order: selectedOrder.id, 
        amount: parseFloat(paymentAmount), 
        status: 'PENDING' 
      });
      toast.success('Payment processed successfully!');
      setSelectedOrder(null);
      setPaymentAmount('');
      loadCompletedOrders();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h2>Final Price Calculation & Payment Simulation</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Process Payment</h3>
          <div className="form-group">
            <label>Select Completed Repair Order</label>
            <select onChange={(e) => {
              const order = repairOrders.find(o => o.id === e.target.value);
              setSelectedOrder(order);
              setPaymentAmount(order?.total_amount || '');
            }}>
              <option value="">Select an order...</option>
              {repairOrders.map(order => (
                <option key={order.id} value={order.id}>
                  Order #{order.id.slice(0,8)} - {order.vehicle?.registration_number} - ${order.total_amount}
                </option>
              ))}
            </select>
          </div>

          {selectedOrder && (
            <>
              <div className="form-group">
                <label>Order Details</label>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                  <p><strong>Vehicle:</strong> {selectedOrder.vehicle?.make} {selectedOrder.vehicle?.model}</p>
                  <p><strong>Registration:</strong> {selectedOrder.vehicle?.registration_number}</p>
                  <p><strong>Issue:</strong> {selectedOrder.issue_description}</p>
                  <hr />
                  <p><strong style={{ fontSize: '18px', color: '#28a745' }}>Total Amount Due: ${selectedOrder.total_amount}</strong></p>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Amount ($)</label>
                <input type="number" step="0.01" value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  placeholder="Enter exact amount" />
              </div>

              <button className="btn btn-success" onClick={handlePayment} disabled={processing} style={{ width: '100%' }}>
                {processing ? 'Processing...' : `Pay $${paymentAmount || 0}`}
              </button>
            </>
          )}
        </div>

        <div className="card">
          <h3>Payment Summary</h3>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontSize: '48px' }}>💰</p>
            <p><strong>Simulated Payment Gateway</strong></p>
            <p style={{ color: '#666', marginTop: '10px' }}>
              This is a simulated payment system.<br />
              No real transactions are processed.<br />
              Amount must match the repair order total.
            </p>
            <hr style={{ margin: '20px 0' }} />
            <p style={{ color: '#28a745' }}>✅ Ready to process payments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSimulation;