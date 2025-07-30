// source/src/views/BuffetView.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import QuestionCard from '../components/questions/QuestionCard';
import { searchQuestions } from '../services/questions';

const BuffetView = ({ currentUser, onShowMessage, setLoading }) => {
  const [questions, setQuestions] = useState([]);
  const [sortType, setSortType] = useState('recent');
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    loadQuestions();
  }, [sortType, searchParams]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const searchQuery = searchParams.get('search');
      const response = await searchQuestions({
        sort: getSortParameter(sortType),
        search: searchQuery
      });
      
      if (response.success) {
        setQuestions(response.questions || []);
      } else {
        onShowMessage('Failed to load questions', 'error');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      onShowMessage('Error loading questions', 'error');
      // Show sample data for development
      setQuestions(getSampleQuestions());
    } finally {
      setLoading(false);
    }
  };

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
    // Navigate to create question (implement later)
    onShowMessage('Create question feature coming soon!', 'info');
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
    </div>
  );
};

export default BuffetView;