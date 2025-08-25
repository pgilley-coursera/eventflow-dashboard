// Dashboard.js
import React from 'react';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>EventFlow Analytics</h1>
      <p>Session tracking and analytics dashboard</p>
      <div className="stats-grid">
        <div>Total Sessions: 12</div>
        <div>Active Users: 847</div>
      </div>
    </div>
  );
}

export default Dashboard;