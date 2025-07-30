// source/src/views/DashboardView.js (Basic placeholder)
import React from 'react';

const DashboardView = ({ currentUser, onShowMessage, setLoading }) => {
  if (!currentUser) {
    return (
      <div className="text-center py-5">
        <h3>Please log in to access dashboard</h3>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <h2>User Dashboard</h2>
      <div className="card">
        <div className="card-body">
          <h5>Welcome, {currentUser.username}!</h5>
          <p>Level: {currentUser.level} • Points: {currentUser.points}</p>
          <p className="text-muted">Dashboard features under construction...</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;