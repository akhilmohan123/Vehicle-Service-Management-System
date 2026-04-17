import React, { useState, useEffect } from 'react';
import { getVehicles, createVehicle, deleteVehicle } from '../services/api';
import toast from 'react-hot-toast';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    registration_number: '', make: '', model: '', year: 2024, vehicle_type: 'CAR',
    owner_name: '', owner_phone: '', owner_email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    const response = await getVehicles();
    setVehicles(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createVehicle(formData);
      toast.success('Vehicle registered');
      setFormData({ registration_number: '', make: '', model: '', year: 2024, vehicle_type: 'CAR', owner_name: '', owner_phone: '', owner_email: '' });
      loadVehicles();
    } catch (error) {
      toast.error('Failed to register vehicle');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      await deleteVehicle(id);
      toast.success('Deleted');
      loadVehicles();
    }
  };

  return (
    <div>
      <h2>Vehicle Management</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Register New Vehicle</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Registration Number</label><input type="text" name="registration_number" value={formData.registration_number} onChange={(e) => setFormData({...formData, registration_number: e.target.value})} required /></div>
            <div className="form-group"><label>Make</label><input type="text" name="make" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} required /></div>
            <div className="form-group"><label>Model</label><input type="text" name="model" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required /></div>
            <div className="form-group"><label>Year</label><input type="number" name="year" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required /></div>
            <div className="form-group"><label>Vehicle Type</label><select name="vehicle_type" value={formData.vehicle_type} onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}>
              <option value="CAR">Car</option><option value="TRUCK">Truck</option><option value="SUV">SUV</option><option value="MOTORCYCLE">Motorcycle</option>
            </select></div>
            <div className="form-group"><label>Owner Name</label><input type="text" name="owner_name" value={formData.owner_name} onChange={(e) => setFormData({...formData, owner_name: e.target.value})} required /></div>
            <div className="form-group"><label>Owner Phone</label><input type="tel" name="owner_phone" value={formData.owner_phone} onChange={(e) => setFormData({...formData, owner_phone: e.target.value})} required /></div>
            <div className="form-group"><label>Owner Email</label><input type="email" name="owner_email" value={formData.owner_email} onChange={(e) => setFormData({...formData, owner_email: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Registering...' : 'Register Vehicle'}</button>
          </form>
        </div>
        <div className="card">
          <h3>Vehicle Database</h3>
          {vehicles.length === 0 ? <p>No vehicles registered yet.</p> : (
            <div style={{overflowX:'auto'}}>
              <table><thead><tr><th>Reg No.</th><th>Make/Model</th><th>Year</th><th>Owner</th><th>Phone</th><th>Action</th></tr></thead>
              <tbody>{vehicles.map(v => (<tr key={v.id}><td>{v.registration_number}</td><td>{v.make} {v.model}</td><td>{v.year}</td><td>{v.owner_name}</td>
              <td>{v.owner_phone}</td><td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button></td></tr>))}</tbody></table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;