import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getDailyRevenue, getMonthlyRevenue, getYearlyRevenue } from '../services/api';
import toast from 'react-hot-toast';

const RevenueGraphs = () => {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      const [daily, monthly, yearly] = await Promise.all([
        getDailyRevenue(),
        getMonthlyRevenue(),
        getYearlyRevenue()
      ]);
      setDailyData(daily.data);
      setMonthlyData(monthly.data);
      setYearlyData(yearly.data);
    } catch (error) {
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `$${value.toFixed(2)}`;
  
  const calculateTotal = (data) => {
    return data.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
  };

  const renderChart = () => {
    const data = activeTab === 'daily' ? dailyData : activeTab === 'monthly' ? monthlyData : yearlyData;
    
    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>No revenue data available. Complete some payments first!</p>
        </div>
      );
    }

    const formatXAxis = (tickItem) => {
      if (activeTab === 'daily') {
        return new Date(tickItem).toLocaleDateString();
      } else if (activeTab === 'monthly') {
        return new Date(tickItem).toLocaleDateString('default', { month: 'short', year: 'numeric' });
      }
      return new Date(tickItem).getFullYear();
    };

    if (activeTab === 'daily') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" name="Daily Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      );
    } else if (activeTab === 'monthly') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Month: ${new Date(label).toLocaleDateString('default', { month: 'long', year: 'numeric' })}`} />
            <Legend />
            <Bar dataKey="revenue" fill="#82ca9d" name="Monthly Revenue" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Year: ${new Date(label).getFullYear()}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#ff7300" name="Yearly Revenue" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Loading revenue data...</h3>
      </div>
    );
  }

  return (
    <div>
      <h2>📊 Revenue Graphs (Daily, Monthly, Yearly)</h2>
      
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('daily')}
          >
            📅 Daily Revenue (Last 30 Days)
          </button>
          <button 
            className={`btn ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('monthly')}
          >
            📆 Monthly Revenue (Last 12 Months)
          </button>
          <button 
            className={`btn ${activeTab === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('yearly')}
          >
            📈 Yearly Revenue (Last 5 Years)
          </button>
        </div>

        {renderChart()}

        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
          <h4>Revenue Summary</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '10px' }}>
            <div>
              <strong>Daily Total (30 days):</strong><br />
              <span style={{ fontSize: '20px', color: '#28a745' }}>{formatCurrency(calculateTotal(dailyData))}</span>
            </div>
            <div>
              <strong>Monthly Total (12 months):</strong><br />
              <span style={{ fontSize: '20px', color: '#28a745' }}>{formatCurrency(calculateTotal(monthlyData))}</span>
            </div>
            <div>
              <strong>Yearly Total (5 years):</strong><br />
              <span style={{ fontSize: '20px', color: '#28a745' }}>{formatCurrency(calculateTotal(yearlyData))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueGraphs;