// source/src/views/AuthView.js - Updated with Real Authentication
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, registerUser } from '../services/auth';
import { validatePasswordStrength } from '../utils/helpers';

import { useEffect } from 'react';
const AuthView = ({ currentUser, onLogin, onShowMessage, setLoading }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    captcha: '',
    rememberMe: false
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
   
    if (loginAttempts >= 3) {
      onShowMessage('Too many failed attempts. Please wait 1 hour.', 'error');
      return;
    }
   
    setLoading(true);

    try {
      const result = await authenticateUser(formData.username, formData.password);
     
      if (result.success) {
        // Handle remember me functionality
        if (formData.rememberMe) {
          localStorage.setItem('qOverflowRemember', 'true');
        }
       
        onLogin(result.user);
        navigate('/');
        onShowMessage('Logged in successfully!', 'success');
        setLoginAttempts(0);
      } else {
        setLoginAttempts(prev => prev + 1);
        const remainingAttempts = 3 - (loginAttempts + 1);
        onShowMessage(
          `${result.error}. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          'error'
        );
      }
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      onShowMessage('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
   
    // Validate CAPTCHA
    if (formData.captcha !== '4') {
      onShowMessage('Incorrect CAPTCHA answer. 2 + 2 = 4', 'error');
      return;
    }

    // Validate password strength
    const passwordCheck = validatePasswordStrength(formData.password);
    if (passwordCheck.strength === 'weak') {
      onShowMessage('Password is too weak. Use at least 11 characters.', 'error');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(formData.username)) {
      onShowMessage('Username must be alphanumeric (dashes and underscores allowed)', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        onShowMessage('Account created successfully! Please log in.', 'success');
        setActiveTab('login');
        setFormData(prev => ({ ...prev, password: '', captcha: '' }));
      } else {
        onShowMessage(result.error, 'error');
      }
    } catch (error) {
      onShowMessage('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate password recovery email
      setTimeout(() => {
        onShowMessage('Recovery email sent! Check your console for the simulated email.', 'success');
        console.log(`
🔔 SIMULATED EMAIL RECOVERY:
To: ${formData.email}
Subject: qOverflow Password Recovery

Click this link to reset your password:
https://qoverflow.example.com/reset?token=abc123

This is a simulated email for the competition.
        `);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      onShowMessage('Recovery failed', 'error');
    }
  };

  const passwordStrength = validatePasswordStrength(formData.password);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return null;
  }

  return (
    <div className="auth-view">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
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
                <form onSubmit={handleLogin} autoComplete="on">
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
                  {loginAttempts > 0 && (
                    <div className="alert alert-warning">
                      Failed attempts: {loginAttempts}/3
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loginAttempts >= 3}
                  >
                    Login
                  </button>
                </form>
              )}

              {/* Register Form */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} autoComplete="on">
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
                <form onSubmit={handleRecovery} autoComplete="on">
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