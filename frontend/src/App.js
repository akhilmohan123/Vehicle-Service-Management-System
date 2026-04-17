import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ComponentRegistration from './components/ComponentRegistration';
import VehicleManagement from './components/VehicleManagement';
import IssueReporting from './components/IssueReporting';
import PaymentSimulation from './components/PaymentSimulation';
import RevenueGraphs from './components/RevenueGraphs';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('components');

  return (
    <div className="app">
      <Toaster position="top-right" />
      <div className="container">
        <div className="header">
          <h1>🔧 Vehicle Repair Management System</h1>
          <p>Component Registration | Vehicle Tracking | Issue Reporting | Payment | Revenue Analytics</p>
        </div>
        
        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'components' ? 'active' : ''}`} onClick={() => setActiveTab('components')}>
            📦 Component Registration
          </button>
          <button className={`nav-tab ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>
            🚗 Vehicle Management
          </button>
          <button className={`nav-tab ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>
            🔧 Issue Reporting
          </button>
          <button className={`nav-tab ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
            💳 Payment Simulation
          </button>
          <button className={`nav-tab ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>
            📊 Revenue Graphs
          </button>
        </div>
        
        <div className="content">
          {activeTab === 'components' && <ComponentRegistration />}
          {activeTab === 'vehicles' && <VehicleManagement />}
          {activeTab === 'issues' && <IssueReporting />}
          {activeTab === 'payment' && <PaymentSimulation />}
          {activeTab === 'revenue' && <RevenueGraphs />}
        </div>
      </div>
    </div>
  );
}

export default App;