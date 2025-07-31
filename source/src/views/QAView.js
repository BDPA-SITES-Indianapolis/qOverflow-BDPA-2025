// source/src/views/QAView.js - FIXED VERSION (Rate Limit Friendly)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoteButtons from '../components/questions/VoteButtons';
import AnswerCard from '../components/answers/AnswerCard';
import AnswerForm from '../components/answers/AnswerForm';
import CommentSection from '../components/comments/CommentSection';
import { 
  getQuestion, 
  getQuestionAnswers, 
  incrementQuestionViews 
} from '../services/questions';
import { getGravatarUrlSync, formatTimeAgo, getUserLevel } from '../utils/helpers';

const QAView = ({ currentUser, onShowMessage, setLoading }) => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [sortBy, setSortBy] = useState('votes');
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [questionError, setQuestionError] = useState(null);

  // Load question details
  useEffect(() => {
    const loadQuestion = async () => {
      if (!questionId) {
        navigate('/');
        return;
      }

      setLoading(true);
      setQuestionError(null);
      
      try {
        // Check if this is a sample question
        if (questionId.startsWith('sample-')) {
          const sampleQuestion = getSampleQuestion(questionId);
          setQuestion(sampleQuestion);
          setLoading(false);
          return;
        }

        const response = await getQuestion(questionId);
        
        if (response.success) {
          setQuestion(response.question);
          
          // FIXED: Only try to increment views if question loaded successfully
          // And don't let it block the rest of the page
          setTimeout(async () => {
            try {
              await incrementQuestionViews(questionId);
              setQuestion(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
            } catch (viewError) {
              // Silently fail - don't show error to user for view increment
              console.log('View increment failed (this is okay):', viewError.message);
            }
          }, 1000); // Wait 1 second before incrementing views
          
        } else {
          throw new Error('Question not found');
        }
      } catch (error) {
        console.error('Error loading question:', error);
        
        if (error.response?.status === 404) {
          setQuestionError('Question not found');
          onShowMessage('Question not found', 'error');
        } else if (error.response?.status === 429) {
          // For rate limiting, show sample data instead
          setQuestionError(null);
          setQuestion(getSampleQuestion('sample-fallback'));
          onShowMessage('Using sample data due to API rate limiting', 'info');
        } else {
          setQuestionError('Error loading question');
          onShowMessage('Error loading question', 'error');
        }
      } finally {
        setLoading(false); // ALWAYS finish loading
      }
    };

    loadQuestion();
  }, [questionId, navigate, setLoading, onShowMessage]);

  // Load answers - FIXED: Only load if question exists and loading is complete
  useEffect(() => {
    if (!question) return;
    
    const loadAnswers = async () => {
      if (question.question_id.startsWith('sample-')) {
        setAnswers(getSampleAnswers());
        return;
      }

      setIsLoadingAnswers(true);
      try {
        const response = await getQuestionAnswers(questionId);
        
        if (response.success) {
          let sortedAnswers = [...(response.answers || [])];
          sortedAnswers = sortAnswers(sortedAnswers, sortBy);
          setAnswers(sortedAnswers);
        } else {
          setAnswers([]);
        }
      } catch (error) {
        console.error('Error loading answers:', error);
        
        if (error.response?.status === 429) {
          onShowMessage('Rate limited loading answers. Using sample data.', 'info');
        }
        
        setAnswers(getSampleAnswers());
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    // Add delay to prevent immediate API call after question loads
    const timeoutId = setTimeout(loadAnswers, 300);
    return () => clearTimeout(timeoutId);
  }, [question, questionId, sortBy]);

  const getSampleQuestion = (id) => {
    const sampleQuestions = {
      'sample-1': {
        question_id: 'sample-1',
        title: 'How to implement authentication in React?',
        text: 'I am trying to implement user authentication in my React application using JWT tokens. What are the best practices for storing tokens and managing user sessions?',
        creator: 'user123',
        createdAt: Date.now() - 7200000,
        upvotes: 5,
        downvotes: 0,
        answers: 3,
        views: 25,
        comments: 2,
        status: 'open',
        hasAcceptedAnswer: false
      },
      'sample-fallback': {
        question_id: 'sample-fallback',
        title: 'Sample Question (Rate Limited)',
        text: 'This is sample content shown when the API is rate limited. The real question will load when the rate limit resets.',
        creator: 'demo_user',
        createdAt: Date.now() - 3600000,
        upvotes: 0,
        downvotes: 0,
        answers: 1,
        views: 1,
        comments: 0,
        status: 'open',
        hasAcceptedAnswer: false
      }
    };
    
    return sampleQuestions[id] || sampleQuestions['sample-fallback'];
  };

  const getSampleAnswers = () => [
    {
      answer_id: 'sample-answer-1',
      question_id: questionId,
      creator: 'reactexpert',
      createdAt: Date.now() - 3600000,
      text: 'This is a sample answer shown due to API rate limiting. Real answers will load when the rate limit resets.\n\nFor authentication in React, consider using:\n\n- JWT tokens stored in httpOnly cookies\n- Context API for state management\n- Protected route components',
      upvotes: 8,
      downvotes: 0,
      accepted: false
    }
  ];

  const sortAnswers = (answersArray, sortType) => {
    const sorted = [...answersArray];
    
    sorted.sort((a, b) => {
      if (a.accepted && !b.accepted) return -1;
      if (!a.accepted && b.accepted) return 1;
      
      switch (sortType) {
        case 'votes':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        default:
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
    });
    
    return sorted;
  };

  const handleNewAnswer = (newAnswer) => {
    setAnswers(prev => sortAnswers([newAnswer, ...prev], sortBy));
    setShowAnswerForm(false);
    onShowMessage('Answer posted successfully!', 'success');
    
    setQuestion(prev => prev ? { ...prev, answers: prev.answers + 1 } : null);
  };

  const handleAnswerUpdate = (updatedAnswer) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.answer_id === updatedAnswer.answer_id ? updatedAnswer : answer
      )
    );
  };

  const handleAcceptAnswer = (answerId) => {
    setAnswers(prev => 
      prev.map(answer => ({
        ...answer,
        accepted: answer.answer_id === answerId
      }))
    );
    
    setQuestion(prev => prev ? { ...prev, hasAcceptedAnswer: true } : null);
    onShowMessage('Answer accepted!', 'success');
  };

  // Show error state
  if (questionError) {
    return (
      <div className="text-center py-5">
        <h3>⚠️ {questionError}</h3>
        <p className="text-muted">The question you're looking for could not be loaded.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/')}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Show loading state
  if (!question) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading question...</span>
        </div>
        <p className="mt-2">Loading question...</p>
      </div>
    );
  }

  const canAcceptAnswers = currentUser && question && currentUser.username === question.creator;
  const canAnswer = currentUser && getUserLevel(currentUser.points) >= 1;
  const canComment = currentUser && (
    getUserLevel(currentUser.points) >= 3 || 
    currentUser.username === question?.creator
  );

  return (
    <div className="qa-view">
      {/* Rate Limit Notice */}
      {question.question_id.startsWith('sample-') && (
        <div className="alert alert-info mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Sample Data:</strong> Showing sample content due to API rate limiting. 
          Real data will load when the rate limit resets.
        </div>
      )}

      {/* Question Header */}
      <div className="question-header mb-4">
        <h1 className="question-title">{question.title}</h1>
        
        <div className="question-meta d-flex flex-wrap gap-3 text-muted mb-3">
          <span>
            <i className="fas fa-clock me-1"></i>
            Asked {formatTimeAgo(question.createdAt)}
          </span>
          <span>
            <i className="fas fa-eye me-1"></i>
            Viewed {question.views || 0} times
          </span>
          {question.status !== 'open' && (
            <span className={`badge ${
              question.status === 'closed' ? 'bg-danger' : 'bg-warning'
            }`}>
              {question.status.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="question-content card mb-4">
        <div className="card-body">
          <div className="d-flex">
            {/* Vote Buttons */}
            <div className="me-3">
              <VoteButtons
                itemType="question"
                itemId={question.question_id}
                upvotes={question.upvotes}
                downvotes={question.downvotes}
                currentUser={currentUser}
                onShowMessage={onShowMessage}
              />
            </div>

            {/* Question Body */}
            <div className="flex-grow-1">
              <div className="question-text mb-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {question.text}
                </ReactMarkdown>
              </div>

              {/* Question Author */}
              <div className="d-flex justify-content-between align-items-end">
                <div></div>
                <div className="question-author d-flex align-items-center">
                  <img
                    src={getGravatarUrlSync(question.creator + '@example.com')}
                    alt={`${question.creator} avatar`}
                    className="user-avatar me-2"
                  />
                  <div>
                    <div className="fw-medium">{question.creator}</div>
                    <small className="text-muted">
                      Level {getUserLevel(1)} • {formatTimeAgo(question.createdAt)}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments on Question */}
      <CommentSection
        parentType="question"
        parentId={question.question_id}
        currentUser={currentUser}
        canComment={canComment}
        onShowMessage={onShowMessage}
      />

      {/* Answers Section */}
      <div className="answers-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h3>
          
          {/* Sort Options */}
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Sorted by: {
                sortBy === 'votes' ? 'Highest Score' :
                sortBy === 'newest' ? 'Newest' : 'Oldest'
              }
            </button>
            <ul className="dropdown-menu">
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => setSortBy('votes')}
                >
                  Highest Score (default)
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => setSortBy('newest')}
                >
                  Date modified (newest first)
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => setSortBy('oldest')}
                >
                  Date modified (oldest first)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Loading Answers */}
        {isLoadingAnswers && (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading answers...</span>
            </div>
          </div>
        )}

        {/* Answers List */}
        <div className="answers-list">
          {answers.map((answer, index) => (
            <AnswerCard
              key={answer.answer_id}
              answer={answer}
              questionId={question.question_id}
              currentUser={currentUser}
              canAccept={canAcceptAnswers && !question.hasAcceptedAnswer}
              canComment={canComment}
              onShowMessage={onShowMessage}
              onAccept={() => handleAcceptAnswer(answer.answer_id)}
              onUpdate={handleAnswerUpdate}
              isLast={index === answers.length - 1}
            />
          ))}
        </div>

        {/* No Answers Message */}
        {!isLoadingAnswers && answers.length === 0 && (
          <div className="text-center py-5">
            <h5>No answers yet</h5>
            <p className="text-muted">Be the first to answer this question!</p>
          </div>
        )}

        {/* Your Answer Form */}
        {question.status === 'open' && (
          <div className="your-answer-section mt-4">
            {!showAnswerForm ? (
              <div className="text-center">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAnswerForm(true)}
                  disabled={!canAnswer}
                >
                  {!currentUser ? 'Log in to Answer' :
                   !canAnswer ? 'Need Level 1 to Answer' :
                   'Write Your Answer'}
                </button>
                {!currentUser && (
                  <p className="text-muted mt-2">
                    Please <Link to="/auth">log in</Link> to post an answer.
                  </p>
                )}
                {currentUser && !canAnswer && (
                  <p className="text-muted mt-2">
                    You need Level 1 (1 point) to post answers.
                  </p>
                )}
              </div>
            ) : (
              <AnswerForm
                questionId={question.question_id}
                currentUser={currentUser}
                onShowMessage={onShowMessage}
                setLoading={setLoading}
                onCancel={() => setShowAnswerForm(false)}
                onSuccess={handleNewAnswer}
              />
            )}
          </div>
        )}

        {/* Closed Question Message */}
        {question.status === 'closed' && (
          <div className="alert alert-warning mt-4">
            <i className="fas fa-lock me-2"></i>
            This question is closed and cannot receive new answers.
          </div>
        )}

        {/* Protected Question Message */}
        {question.status === 'protected' && currentUser && getUserLevel(currentUser.points) < 5 && (
          <div className="alert alert-info mt-4">
            <i className="fas fa-shield-alt me-2"></i>
            This question is protected. You need Level 5 (1000 points) to answer.
          </div>
        )}
      </div>
    </div>
  );
};

export default QAView;