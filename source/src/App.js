// source/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import BuffetView from './views/BuffetView';
import QAView from './views/QAView';
import MailView from './views/MailView';
import DashboardView from './views/DashboardView';
import AuthView from './views/AuthView';
import CreateQuestionView from './views/CreateQuestionView';
import LoadingSpinner from './components/common/LoadingSpinner';
import MessageContainer from './components/common/MessageContainer';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Initialize app - check for saved user
  useEffect(() => {
    const savedUser = localStorage.getItem('qOverflowUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('qOverflowUser');
      }
    }
  }, []);

  // Show message function
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  // Login function
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('qOverflowUser', JSON.stringify(userData));
    showMessage('Logged in successfully!', 'success');
  };

  // Logout function
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('qOverflowUser');
    showMessage('Logged out successfully', 'success');
  };

  // Helper to protect routes
  const RequireAuth = ({ children }) => {
    const location = useLocation();
    if (!currentUser) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Navigation
          currentUser={currentUser}
          onLogout={handleLogout}
          onShowMessage={showMessage}
        />
        <div className="container view-container">
          {loading && <LoadingSpinner />}
          <MessageContainer message={message} />
          <Routes>
            <Route
              path="/auth"
              element={
                <AuthView
                  currentUser={currentUser}
                  onLogin={handleLogin}
                  onShowMessage={showMessage}
                  setLoading={setLoading}
                />
              }
            />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <BuffetView
                    currentUser={currentUser}
                    onShowMessage={showMessage}
                    setLoading={setLoading}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/question/:questionId"
              element={
                <RequireAuth>
                  <QAView
                    currentUser={currentUser}
                    onShowMessage={showMessage}
                    setLoading={setLoading}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/mail"
              element={
                <RequireAuth>
                  <MailView
                    currentUser={currentUser}
                    onShowMessage={showMessage}
                    setLoading={setLoading}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardView
                    currentUser={currentUser}
                    onShowMessage={showMessage}
                    setLoading={setLoading}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/create-question"
              element={
                <RequireAuth>
                  <CreateQuestionView
                    currentUser={currentUser}
                    onShowMessage={showMessage}
                    setLoading={setLoading}
                  />
                </RequireAuth>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;