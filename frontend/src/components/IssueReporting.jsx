import React, { useState, useEffect } from 'react';
import { getVehicles, getComponents, createRepairOrder, addRepairItem, getRepairOrders, completeRepairOrder } from '../services/api';
import toast from 'react-hot-toast';

const IssueReporting = () => {
  const [vehicles, setVehicles] = useState([]);
  const [components, setComponents] = useState([]);
  const [repairOrders, setRepairOrders] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [newItem, setNewItem] = useState({ component_id: '', action_type: 'REPAIR', quantity: 1, labor_cost: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [vehiclesRes, componentsRes, ordersRes] = await Promise.all([
      getVehicles(), getComponents(), getRepairOrders()
    ]);
    setVehicles(vehiclesRes.data);
    setComponents(componentsRes.data);
    setRepairOrders(ordersRes.data);
  };

  const createNewRepairOrder = async () => {
    if (!selectedVehicle || !issueDescription) {
      toast.error('Please select vehicle and describe issue');
      return null;
    }
    const response = await createRepairOrder({ 
      vehicle: selectedVehicle, 
      issue_description: issueDescription, 
      status: 'PENDING' 
    });
    setCurrentOrderId(response.data.id);
    toast.success('Repair order created');
    return response.data.id;
  };

  const addItemToOrder = async () => {
    if (!currentOrderId && !(await createNewRepairOrder())) return;
    if (!newItem.component_id) { 
      toast.error('Please select a component'); 
      return; 
    }
    
    const selectedComp = components.find(c => c.id === newItem.component_id);
    const unitPrice = newItem.action_type === 'PURCHASE' ? selectedComp.purchase_price : selectedComp.repair_price;
    
    await addRepairItem(currentOrderId, {
      component: newItem.component_id,
      action_type: newItem.action_type,
      quantity: parseInt(newItem.quantity),
      unit_price: unitPrice,
      labor_cost: parseFloat(newItem.labor_cost),
      description: `${newItem.action_type === 'PURCHASE' ? 'Purchase' : 'Repair'} of ${selectedComp.name}`
    });
    
    toast.success('Item added to repair order');
    setNewItem({ component_id: '', action_type: 'REPAIR', quantity: 1, labor_cost: 0 });
    loadData();
  };

  const completeOrder = async (orderId) => {
    await completeRepairOrder(orderId);
    toast.success('Repair order completed');
    loadData();
    setCurrentOrderId(null);
    setSelectedVehicle('');
    setIssueDescription('');
  };

  return (
    <div>
      <h2>Issue Reporting & Component Selection</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Create New Repair Order</h3>
          <div className="form-group">
            <label>Select Vehicle</label>
            <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} disabled={currentOrderId}>
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Issue Description</label>
            <textarea rows="3" value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} disabled={currentOrderId} 
              placeholder="Describe the vehicle issue in detail..." />
          </div>
          {!currentOrderId && <button className="btn btn-primary" onClick={createNewRepairOrder}>Create Repair Order</button>}
          
          {currentOrderId && (
            <>
              <hr style={{ margin: '20px 0' }} />
              <h4>Add Component (Choose Repair or Purchase)</h4>
              <div className="form-group">
                <label>Select Component</label>
                <select value={newItem.component_id} onChange={(e) => setNewItem({...newItem, component_id: e.target.value})}>
                  <option value="">Select component...</option>
                  {components.map(c => <option key={c.id} value={c.id}>{c.name} (Buy: ${c.purchase_price} | Repair: ${c.repair_price})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Action Type</label>
                <select value={newItem.action_type} onChange={(e) => setNewItem({...newItem, action_type: e.target.value})}>
                  <option value="REPAIR">Repair Service</option>
                  <option value="PURCHASE">Purchase New Component</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Labor Cost ($)</label>
                <input type="number" step="0.01" value={newItem.labor_cost} onChange={(e) => setNewItem({...newItem, labor_cost: e.target.value})} />
              </div>
              <button className="btn btn-secondary" onClick={addItemToOrder}>Add to Order</button>
            </>
          )}
        </div>

        <div className="card">
          <h3>Repair Orders</h3>
          {repairOrders.length === 0 ? <p>No repair orders yet.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Vehicle</th><th>Issue</th><th>Status</th><th>Total Amount</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {repairOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id.slice(0,8)}</td>
                      <td>{order.vehicle?.registration_number}</td>
                      <td>{order.issue_description?.substring(0, 40)}...</td>
                      <td><span style={{ padding: '3px 8px', borderRadius: '5px', 
                        background: order.status === 'COMPLETED' ? '#d4edda' : '#fff3cd',
                        color: order.status === 'COMPLETED' ? '#155724' : '#856404' }}>
                        {order.status}
                      </span></td>
                      <td><strong>${order.total_amount}</strong></td>
                      <td>{order.status === 'PENDING' && 
                        <button className="btn btn-success btn-sm" onClick={() => completeOrder(order.id)}>Complete</button>
                       }</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueReporting;