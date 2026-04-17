import React, { useState, useEffect } from 'react';
import { getComponents, createComponent, deleteComponent } from '../services/api';
import toast from 'react-hot-toast';

const ComponentRegistration = () => {
  const [components, setComponents] = useState([]);
  const [formData, setFormData] = useState({
    name: '', component_type: 'OTHER', purchase_price: '', repair_price: '', description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadComponents(); }, []);

  const loadComponents = async () => {
    const response = await getComponents();
    setComponents(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createComponent(formData);
      toast.success('Component registered successfully');
      setFormData({ name: '', component_type: 'OTHER', purchase_price: '', repair_price: '', description: '' });
      loadComponents();
    } catch (error) {
      toast.error('Failed to register component');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this component?')) {
      await deleteComponent(id);
      toast.success('Deleted');
      loadComponents();
    }
  };

  return (
    <div>
      <h2>Component Registration & Pricing</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Register New Component</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Component Name</label><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
            <div className="form-group"><label>Type</label><select name="component_type" value={formData.component_type} onChange={(e) => setFormData({...formData, component_type: e.target.value})}>
              <option value="ENGINE">Engine</option><option value="TRANSMISSION">Transmission</option>
              <option value="BRAKE">Brake</option><option value="BATTERY">Battery</option><option value="TIRE">Tire</option><option value="OTHER">Other</option>
            </select></div>
            <div className="form-group"><label>Purchase Price ($)</label><input type="number" step="0.01" name="purchase_price" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} required /></div>
            <div className="form-group"><label>Repair Price ($)</label><input type="number" step="0.01" name="repair_price" value={formData.repair_price} onChange={(e) => setFormData({...formData, repair_price: e.target.value})} required /></div>
            <div className="form-group"><label>Description</label><textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Registering...' : 'Register Component'}</button>
          </form>
        </div>
        <div className="card">
          <h3>Component Inventory</h3>
          {components.length === 0 ? <p>No components registered yet.</p> : (
            <div style={{overflowX:'auto'}}>
              <table><thead><tr><th>Name</th><th>Type</th><th>Purchase</th><th>Repair</th><th>Action</th></tr></thead>
              <tbody>{components.map(c => (<tr key={c.id}><td>{c.name}</td><td>{c.component_type}</td><td>${c.purchase_price}</td><td>${c.repair_price}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button></td></tr>))}</tbody></table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentRegistration;