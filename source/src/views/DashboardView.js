// source/src/views/DashboardView.js - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import QuestionCard from '../components/questions/QuestionCard';
import { searchQuestions } from '../services/questions';
import { getGravatarUrl, getUserLevel } from '../utils/helpers';
import api from '../services/api';

const DashboardView = ({ currentUser, onShowMessage, setLoading }) => {
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadUserQuestions = async () => {
    setIsLoadingData(true);
    try {
      // Use search method directly (skip the direct API that gets rate limited)
      const searchResponse = await searchQuestions({});
      if (searchResponse.success) {
        const allQuestions = searchResponse.questions || [];
        const userQs = allQuestions.filter(q => q.creator === currentUser.username);
        setUserQuestions(userQs);
      }
    } catch (err) {
      console.error('Error loading user questions:', err);
      onShowMessage('Error loading your questions.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // FIXED: Simple useEffect without dependency issues
  useEffect(() => {
    if (currentUser) {
      loadUserQuestions();
    }
  }, []); // Only run once when component mounts

  if (!currentUser) {
    return (
      <div className="text-center py-5">
        <div className="card">
          <div className="card-body">
            <h3>Please log in to access dashboard</h3>
            <p className="text-muted">You need to be logged in to view your dashboard.</p>
            <Link to="/auth" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userLevel = getUserLevel(currentUser.points || 1);
  const gravatarUrl = getGravatarUrl(currentUser.email);

  return (
    <div className="dashboard-view">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <Link to="/create-question" className="btn btn-primary">
          <i className="fas fa-plus me-1"></i>
          Ask Question
        </Link>
      </div>

      {/* User Profile Card */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <img 
              src={gravatarUrl}
              alt="User avatar"
              className="rounded-circle me-3"
              width={64}
              height={64}
              onError={(e) => {
                e.target.src = getGravatarUrl('default@example.com');
              }}
            />
            <div>
              <h4 className="mb-1">Welcome, {currentUser.username}!</h4>
              <div className="d-flex gap-3 align-items-center">
                <span className="badge bg-primary">Level {userLevel}</span>
                <span className="badge bg-success">{currentUser.points || 1} points</span>
              </div>
              <p className="text-muted mb-0 mt-1">
                Member since {new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{userQuestions.length}</h3>
              <p className="card-text">Questions Asked</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{userAnswers.length}</h3>
              <p className="card-text">Answers Given</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">{currentUser.points || 1}</h3>
              <p className="card-text">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Questions Section */}
      <div className="user-questions-section mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Your Questions</h4>
          {userQuestions.length > 0 && (
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={loadUserQuestions}
              disabled={isLoadingData}
            >
              <i className="fas fa-refresh me-1"></i>
              Refresh
            </button>
          )}
        </div>

        {isLoadingData ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : userQuestions.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
              <h5>No questions yet</h5>
              <p className="text-muted">You haven't asked any questions yet. Start by asking your first question!</p>
              <Link to="/create-question" className="btn btn-primary">
                <i className="fas fa-plus me-1"></i>
                Ask Your First Question
              </Link>
            </div>
          </div>
        ) : (
          <div className="questions-list">
            {userQuestions.map((question) => (
              <QuestionCard
                key={question.question_id}
                question={question}
                currentUser={currentUser}
                onShowMessage={onShowMessage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Account Settings Section */}
      <div className="account-settings-section">
        <h4 className="mb-3">Account Settings</h4>
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Email Address</h6>
                <p className="text-muted">{currentUser.email}</p>
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  Change Email (Coming Soon)
                </button>
              </div>
              <div className="col-md-6">
                <h6>Password</h6>
                <p className="text-muted">••••••••</p>
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  Change Password (Coming Soon)
                </button>
              </div>
            </div>
            <hr />
            <div className="row mt-3">
              <div className="col-12">
                <h6 className="text-danger">Danger Zone</h6>
                <button className="btn btn-outline-danger btn-sm" disabled>
                  Delete Account (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;