// source/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
              path="/" 
              element={
                <BuffetView 
                  currentUser={currentUser} 
                  onShowMessage={showMessage}
                  setLoading={setLoading}
                />
              } 
            />
            <Route 
              path="/question/:questionId" 
              element={
                <QAView 
                  currentUser={currentUser} 
                  onShowMessage={showMessage}
                  setLoading={setLoading}
                />
              } 
            />
            <Route 
              path="/mail" 
              element={
                <MailView 
                  currentUser={currentUser} 
                  onShowMessage={showMessage}
                  setLoading={setLoading}
                />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <DashboardView 
                  currentUser={currentUser} 
                  onShowMessage={showMessage}
                  setLoading={setLoading}
                />
              } 
            />
            <Route 
              path="/create-question" 
              element={
                <CreateQuestionView 
                  currentUser={currentUser} 
                  onShowMessage={showMessage}
                  setLoading={setLoading}
                />
              } 
            />
            <Route 
              path="/auth" 
              element={
                <AuthView 
                  onLogin={handleLogin}
                  onShowMessage={showMessage}
                  setLoading={setLoading}
                />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;