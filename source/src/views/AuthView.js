// source/src/views/AuthView.js
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { validatePasswordStrength } from '../utils/helpers';

const AuthView = ({ onLogin, onShowMessage, setLoading }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    captcha: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate login for development
      const mockUser = {
        username: formData.username,
        email: formData.username + '@example.com',
        points: 25,
        level: 2
      };

      setTimeout(() => {
        onLogin(mockUser);
        setLoading(false);
      }, 1000);

    } catch (error) {
      setLoading(false);
      onShowMessage('Login failed', 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.captcha !== '4') {
      onShowMessage('Incorrect CAPTCHA answer', 'error');
      return;
    }

    const passwordCheck = validatePasswordStrength(formData.password);
    if (passwordCheck.strength === 'weak') {
      onShowMessage('Password is too weak. Use at least 11 characters.', 'error');
      return;
    }

    setLoading(true);

    try {
      // Simulate registration
      setTimeout(() => {
        onShowMessage('Account created successfully! Please log in.', 'success');
        setActiveTab('login');
        setLoading(false);
      }, 1000);

    } catch (error) {
      setLoading(false);
      onShowMessage('Registration failed', 'error');
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate password recovery
      setTimeout(() => {
        onShowMessage('Recovery email sent! Check your console for the simulated email.', 'success');
        console.log(`SIMULATED EMAIL: Password recovery link sent to ${formData.email}`);
        setLoading(false);
      }, 1000);

    } catch (error) {
      setLoading(false);
      onShowMessage('Recovery failed', 'error');
    }
  };

  const passwordStrength = validatePasswordStrength(formData.password);

  return (
    <div className="auth-view">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                  >
                    Register
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'recovery' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recovery')}
                  >
                    Forgot Password
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="card-body">
              {/* Login Form */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Remember me</label>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Login
                  </button>
                </form>
              )}

              {/* Register Form */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      pattern="[a-zA-Z0-9_-]+"
                      title="Username must be alphanumeric (dashes and underscores allowed)"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="form-text">
                      Password strength: 
                      <span className={`text-${passwordStrength.color} fw-bold ms-1`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CAPTCHA: What is 2 + 2?</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="captcha"
                      value={formData.captcha}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Register
                  </button>
                </form>
              )}

              {/* Recovery Form */}
              {activeTab === 'recovery' && (
                <form onSubmit={handleRecovery}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Send Recovery Email
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;