// source/src/views/DashboardView.js
import React, { useEffect, useState } from 'react';
import '../components/common/DashboardView.css';
import { Link } from 'react-router-dom';
import QuestionCard from '../components/questions/QuestionCard';
import { searchQuestions } from '../services/questions';
import { getQuestionAnswers } from '../services/questions';
import { getGravatarUrl, getUserLevel } from '../utils/helpers';
import api from '../services/api';

const DashboardView = ({ currentUser, onShowMessage, setLoading }) => {
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [acceptedAnswers, setAcceptedAnswers] = useState([]);
  const [unacceptedAnswers, setUnacceptedAnswers] = useState([]);
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

  // Load all answers by the user (across all questions)
  const loadUserAnswers = async () => {
    setIsLoadingData(true);
    try {
      // Get all questions to find answers
      const searchResponse = await searchQuestions({});
      if (searchResponse.success) {
        const allQuestions = searchResponse.questions || [];
        let allAnswers = [];
        for (const q of allQuestions) {
          // For each question, get its answers
          try {
            const ansRes = await getQuestionAnswers(q.question_id);
            if (ansRes.success && Array.isArray(ansRes.answers)) {
              // Only add answers by this user
              const userAns = ansRes.answers.filter(a => a.creator === currentUser.username);
              allAnswers = allAnswers.concat(userAns.map(a => ({ ...a, question: q })));
            }
          } catch (e) {
            // Ignore errors for individual questions
          }
        }
        setUserAnswers(allAnswers);
        setAcceptedAnswers(allAnswers.filter(a => a.accepted));
        setUnacceptedAnswers(allAnswers.filter(a => !a.accepted));
      }
    } catch (err) {
      console.error('Error loading user answers:', err);
      onShowMessage('Error loading your answers.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // FIXED: Simple useEffect without dependency issues
  useEffect(() => {
    if (currentUser) {
      loadUserQuestions();
      loadUserAnswers();
    }
    // eslint-disable-next-line
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
              <h4 className="mb-1" id="blacktext">Welcome, {currentUser.username}!</h4>
              <div className="d-flex gap-3 align-items-center">
                <span className="badge bg-primary">Level {userLevel}</span>
                <span className="badge bg-success">{currentUser.points || 1} points</span>
              </div>
              <p className="text-muted mb-0 mt-1"id="greytext">
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
              <h3 className="text-primary" id="bluetext">{userQuestions.length}</h3>
              <p className="card-text"id="blacktext">Questions Asked</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success" id="greentext">{userAnswers.length}</h3>
              <p className="card-text" id="blacktext">Answers Given</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning" id="orangetext">{currentUser.points || 1}</h3>
              <p className="card-text" id="blacktext">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Answers Section */}
      <div className="user-answers-section mb-4">
        <h4>Your Answers</h4>
        {isLoadingData ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <strong class = "dark-mode">Accepted Answers ({acceptedAnswers.length})</strong>
              {acceptedAnswers.length === 0 && <div className="text-muted">No accepted answers yet.</div>}
              <ul className="list-group mb-3">
                {acceptedAnswers.map(ans => (
                  <li className="list-group-item" key={ans.answer_id}>
                    <span className="badge bg-success me-2">Accepted</span>
                    <span>{ans.text.slice(0, 80)}...</span>
                    <br />
                    <small>On question: <Link to={`/questions/${ans.question.question_id}`}>{ans.question.title}</Link></small>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong class = "dark-mode">Unaccepted Answers ({unacceptedAnswers.length})</strong>
              {unacceptedAnswers.length === 0 && <div className="text-muted">No unaccepted answers yet.</div>}
              <ul className="list-group">
                {unacceptedAnswers.map(ans => (
                  <li className="list-group-item" key={ans.answer_id}>
                    <span className="badge bg-secondary me-2">Not Accepted</span>
                    <span>{ans.text.slice(0, 80)}...</span>
                    <br />
                    <small>On question: <Link to={`/questions/${ans.question.question_id}`}>{ans.question.title}</Link></small>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
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
              <h5 id="blacktext">No questions yet</h5>
              <p className="text-muted"id="greytext">You haven't asked any questions yet. Start by asking your first question!</p>
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
                <h6 id="blacktext">Email Address</h6>
                <p className="text-muted"id="greytext">{currentUser.email}</p>
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  Change Email (Coming Soon)
                </button>
              </div>
              <div className="col-md-6">
                <h6 id="blacktext">Password</h6>
                <p className="text-muted"id="greytext">••••••••</p>
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  Change Password (Coming Soon)
                </button>
              </div>
            </div>
            <hr />
            <div className="row mt-3">
              <div className="col-12">
                <h6 className="text-danger" id="redtext">Danger Zone</h6>
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