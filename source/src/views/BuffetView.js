// source/src/views/BuffetView.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/questions/QuestionCard';
import QuestionModal from '../components/questions/QuestionModal';
import { searchQuestions } from '../services/questions';

const BuffetView = ({ currentUser, onShowMessage, setLoading }) => {
  const [questions, setQuestions] = useState([]);
  const [sortType, setSortType] = useState('recent');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadQuestions();
  }, [sortType, searchParams]); // Remove loadQuestions from dependency array

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const searchQuery = searchParams.get('search');
      const response = await searchQuestions({
        sort: getSortParameter(sortType),
        search: searchQuery
      });
      
      if (response.success) {
        setQuestions(response.questions || []);
        
        if (response.questions?.length === 0) {
          onShowMessage('No questions found', 'info');
        }
      } else {
        onShowMessage('Failed to load questions', 'error');
        // Fallback to sample data for development
        setQuestions(getSampleQuestions());
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      
      // Handle specific API errors
      if (error.response?.status === 401) {
        onShowMessage('API authentication failed. Check your API key.', 'error');
      } else if (error.response?.status === 429) {
        onShowMessage('Too many requests. Please wait a moment.', 'error');
      } else if (error.response?.status === 555) {
        onShowMessage('API returned temporary error (this is expected behavior)', 'info');
      } else {
        onShowMessage('Error loading questions. Using sample data.', 'error');
      }
      
      // Show sample data as fallback
      setQuestions(getSampleQuestions());
    } finally {
      setLoading(false);
    }
  }, [sortType, searchParams, onShowMessage, setLoading]); // Add dependencies

  const getSortParameter = (sortType) => {
    switch (sortType) {
      case 'best': return 'u';
      case 'interesting': return 'uvc';
      case 'hot': return 'uvac';
      default: return ''; // recent (default)
    }
  };

  const getSampleQuestions = () => [
    {
      question_id: '1',
      title: 'How to implement authentication in React?',
      text: 'I am trying to implement user authentication in my React application...',
      creator: 'user123',
      createdAt: Date.now() - 7200000, // 2 hours ago
      upvotes: 5,
      downvotes: 0,
      answers: 3,
      views: 25,
      status: 'open'
    },
    {
      question_id: '2', 
      title: 'Best practices for API integration',
      text: 'What are the best practices when integrating with REST APIs...',
      creator: 'developer456',
      createdAt: Date.now() - 14400000, // 4 hours ago
      upvotes: 8,
      downvotes: 1,
      answers: 5,
      views: 42,
      status: 'open'
    }
  ];

  const handleSortChange = (newSortType) => {
    setSortType(newSortType);
    // Update active button styling
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-sort="${newSortType}"]`).classList.add('active');
  };

  const showCreateQuestion = () => {
    if (!currentUser) {
      onShowMessage('Please log in to ask a question', 'error');
      return;
    }
    
    // Option 1: Navigate to dedicated page
    navigate('/create-question');
    
    // Option 2: Show modal (uncomment to use modal instead)
    // setShowQuestionModal(true);
  };

  const handleQuestionCreated = () => {
    // Refresh questions list after new question is created
    loadQuestions();
    setShowQuestionModal(false);
  };

  return (
    <div className="buffet-view">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Latest Questions</h2>
        <button 
          className="btn btn-primary" 
          onClick={showCreateQuestion}
        >
          Ask Question
        </button>
      </div>

      {/* Sort Options */}
      <div className="mb-3">
        <div className="btn-group" role="group">
          <button 
            className={`btn btn-outline-secondary sort-btn ${sortType === 'recent' ? 'active' : ''}`}
            data-sort="recent"
            onClick={() => handleSortChange('recent')}
          >
            Most Recent
          </button>
          <button 
            className={`btn btn-outline-secondary sort-btn ${sortType === 'best' ? 'active' : ''}`}
            data-sort="best"
            onClick={() => handleSortChange('best')}
          >
            Best Questions
          </button>
          <button 
            className={`btn btn-outline-secondary sort-btn ${sortType === 'interesting' ? 'active' : ''}`}
            data-sort="interesting"
            onClick={() => handleSortChange('interesting')}
          >
            Most Interesting
          </button>
          <button 
            className={`btn btn-outline-secondary sort-btn ${sortType === 'hot' ? 'active' : ''}`}
            data-sort="hot"
            onClick={() => handleSortChange('hot')}
          >
            Hottest
          </button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchParams.get('search') && (
        <div className="alert alert-info">
          Search results for: <strong>{searchParams.get('search')}</strong>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-list">
        {questions.length === 0 ? (
          <div className="text-center py-5">
            <h5>No questions found</h5>
            <p className="text-muted">Be the first to ask a question!</p>
          </div>
        ) : (
          questions.map(question => (
            <QuestionCard 
              key={question.question_id} 
              question={question}
              currentUser={currentUser}
              onShowMessage={onShowMessage}
            />
          ))
        )}
      </div>

      {/* Pagination (implement later) */}
      <nav aria-label="Questions pagination" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className="page-item disabled">
            <span className="page-link">Previous</span>
          </li>
          <li className="page-item active">
            <span className="page-link">1</span>
          </li>
          <li className="page-item">
            <Link className="page-link" to="/?page=2">2</Link>
          </li>
          <li className="page-item">
            <Link className="page-link" to="/?page=3">3</Link>
          </li>
          <li className="page-item">
            <Link className="page-link" to="/?page=2">Next</Link>
          </li>
        </ul>
      </nav>

      {/* Question Creation Modal (if using modal option) */}
      <QuestionModal
        show={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        currentUser={currentUser}
        onShowMessage={onShowMessage}
        setLoading={setLoading}
      />
    </div>
  );
};

export default BuffetView;