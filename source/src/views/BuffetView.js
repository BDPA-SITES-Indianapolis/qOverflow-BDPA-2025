// source/src/views/BuffetView.js 
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/questions/QuestionCard';
import QuestionModal from '../components/questions/QuestionModal';
import Pagination from '../components/common/Pagination';
import { searchQuestions } from '../services/questions';
import { debounce } from '../utils/helpers';

const BuffetView = ({ currentUser, onShowMessage, setLoading }) => {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [sortType, setSortType] = useState('recent');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || ''); // Add a controlled search input state
  const navigate = useNavigate();

  const QUESTIONS_PER_PAGE = 10; // Show 10 questions per page

  // Get current page from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  // Load questions when sort type or search changes
  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line
  }, [sortType, searchParams]);

  // Update displayed questions when page or allQuestions change
  useEffect(() => {
    updateDisplayedQuestions();
    // eslint-disable-next-line
  }, [currentPage, allQuestions]);

  // Keep searchInput in sync with URL
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  // Unified filter function
  function filterQuestions(questions, searchInput) {
    if (!searchInput || !searchInput.trim()) return questions;

    // Extract tags (e.g. #react #api)
    const tagMatches = searchInput.match(/#\w[\w-]*/g) || [];
    const tags = tagMatches.map(tag => tag.slice(1).toLowerCase());

    // Remove tags from search input to get the text part
    const textSearch = searchInput.replace(/#\w[\w-]*/g, '').trim().toLowerCase();
    console.log('Filtering:', { textSearch, tags });
    return questions.filter(q => {
      // Text match (title or body)

      let matchesText = true;
      if (textSearch) {
        //Split textSearch into words and match if ANY word is present in title or text
        const words = textSearch.split(/\s+/).filter(Boolean);
        matchesText = words.some(word =>
          q.title.toLowerCase().includes(word) || q.text.toLowerCase().includes(word)
        );
      }
        
      // Tag match (all tags must be present)
      const matchesTags =
        tags.length === 0 ||
        (q.tags && tags.every(tag =>
          q.tags.some(qt => qt.toLowerCase() === tag)
        ));

      return matchesText && matchesTags;
    });
  }

  // Load questions from API or fallback to sample data
  const loadQuestions = async () => {
    setIsLoading(true);

    try {
      const searchQuery = searchParams.get('search') || '';
      const response = await searchQuestions({
        sort: getSortParameter(sortType),
        search: searchQuery
      });

      if (response.success) {
        const questionsData = response.questions || [];
        setAllQuestions(questionsData);

        if (questionsData.length === 0) {
          onShowMessage('No questions found', 'info');
        }
      } else {
        onShowMessage('Failed to load questions', 'error');
        // Filter sample questions here
        const filtered = filterQuestions(getSampleQuestions(), searchQuery);
        setAllQuestions(filtered);
      }
    } catch (error) {
       console.error('Error loading questions:', error);
     
      if (error.message?.includes('555')) {
        onShowMessage('API temporary error (showing sample data)', 'info');
      } else if (error.response?.status === 429) {
        onShowMessage('Rate limited. Showing sample data.', 'info');
      } else {
        onShowMessage('Error loading questions. Showing sample data.', 'warning');
      }
      // Fallback to filtered sample questions
      const searchQuery = searchParams.get('search') || '';
      const filtered = filterQuestions(getSampleQuestions(), searchQuery);
      setAllQuestions(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // Update questions for current page
  const updateDisplayedQuestions = () => {
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    const pageQuestions = allQuestions.slice(startIndex, endIndex);
    setQuestions(pageQuestions);
  };

  // Sort parameter mapping
  const getSortParameter = (sortType) => {
    switch (sortType) {
      case 'best': return 'u';
      case 'interesting': return 'uvc';
      case 'hot': return 'uvac';
      default: return ''; // recent (default)
    }
  };

  // Sample/mock questions for fallback
  const getSampleQuestions = () => {
    // Generate more sample questions for pagination demo (use when API is banned)
    const baseQuestions = [
      {
        question_id: '1',
        title: 'How to implement authentication in React?',
        text: 'I am trying to implement user authentication in my React application...',
        creator: 'user123',
        createdAt: Date.now() - 7200000,
        upvotes: 5,
        downvotes: 0,
        answers: 3,
        views: 25,
        status: 'open',
        tags: ['react', 'authentication', 'frontend'],
        hasAcceptedAnswer: true
      },
      {
        question_id: '2',
        title: 'Best practices for API integration',
        text: 'What are the best practices when integrating with REST APIs...',
        creator: 'developer456',
        createdAt: Date.now() - 14400000,
        upvotes: 8,
        downvotes: 1,
        answers: 5,
        views: 42,
        status: 'open',
        tags: ['api', 'integration', 'best practices'],
        hasAcceptedAnswer: false
      },
      {
        question_id: '3',
        title: 'React useState vs useReducer - when to use which?',
        text: 'I understand both useState and useReducer, but when should I choose one over the other?',
        creator: 'react_learner',
        createdAt: Date.now() - 21600000,
        upvotes: 12,
        downvotes: 0,
        answers: 7,
        views: 68,
        status: 'open',
        tags: ['react', 'hooks', 'state management'],
        hasAcceptedAnswer: false
      }
    ];

    // Generate additional sample questions for pagination
    const sampleQuestions = [];
    for (let i = 0; i < 25; i++) {
      const base = baseQuestions[i % baseQuestions.length];
      sampleQuestions.push({
        ...base,
        question_id: `sample-${i + 1}`,
        title: `${base.title} (Sample ${i + 1})`,
        createdAt: Date.now() - (i * 3600000), // Spread over hours
        views: Math.floor(Math.random() * 100) + 10,
        upvotes: Math.floor(Math.random() * 20),
        answers: Math.floor(Math.random() * 10),
        tags: [...base.tags] // <-- Use real tags, not suffixed
      });
    }

    return sampleQuestions;
  };

  // Sort button styling
  const getSortButtonClass = (sortValue) => {
    return `btn ${sortType === sortValue ? 'btn-primary' : 'btn-outline-primary'} me-2`;
  };

  // Handle sort change
  const handleSortChange = (newSortType) => {
    setSortType(newSortType);
    setCurrentPage(1); // Reset to first page when sorting changes
    
    // Update URL to remove page parameter when changing sort
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('page');
    setSearchParams(newSearchParams);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    
    // Update URL with new page
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', newPage.toString());
    }
    setSearchParams(newSearchParams);
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show create question modal or navigate
  const showCreateQuestion = () => {
    if (!currentUser) {
      onShowMessage('Please log in to ask a question', 'error');
      return;
    }
    navigate('/create-question');
  };

  // After question created
  const handleQuestionCreated = () => {
    loadQuestions();
    setShowQuestionModal(false);
  };

  

  return (
    <div className="buffet-view">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Questions</h1>
          <p className="text-muted mb-0">
            {allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''}
            {searchParams.get('search') && (
              <>
                <span> matching "{searchParams.get('search').replace(/#\w[\w-]*/g, '').trim()}"</span>
                {(searchParams.get('search').match(/#\w[\w-]*/g) || []).map((tag, idx) => (
                  <span key={idx} className="badge bg-light text-dark border ms-2">{tag}</span>
                ))}
              </>
            )}
          </p>
        </div>
        <div className="d-flex gap-2">
          {currentUser ? (
            <button className="btn btn-primary" onClick={showCreateQuestion}>
              <i className="fas fa-plus me-1"></i>
              Ask Question
            </button>
          ) : (
            <Link to="/auth" className="btn btn-primary">
              <i className="fas fa-sign-in-alt me-1"></i>
              Login to Ask
            </Link>
          )}
        </div>
      </div>

      {/* Unified Search Bar */}
      <form
        className="mb-4"
        onSubmit={e => {
          e.preventDefault();
          const newSearchParams = new URLSearchParams(searchParams);
          if (searchInput.trim()) {
            newSearchParams.set('search', searchInput.trim());
          } else {
            newSearchParams.delete('search');
          }
          newSearchParams.delete('page');
          setSearchParams(newSearchParams);
          setCurrentPage(1);
          loadQuestions();
        }}
      >
        <div className="input-group" style={{ maxWidth: 500 }}>
          <input
            type="text"
            className="form-control"
            placeholder='Search questions or tags (e.g. "react #api #frontend")'
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchParams.get('search') && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete('search');
                newSearchParams.delete('page');
                setSearchParams(newSearchParams);
                setSearchInput('');
                setCurrentPage(1);
                loadQuestions();
              }}
            >
              Clear
            </button>
          )}
          <button className="btn btn-primary" type="submit">
            <i className="fas fa-search me-1"></i>Search
          </button>
        </div>
        <div className="form-text">
          To search by tag, add <code>#tagname</code> (e.g. <code>#react</code>).
        </div>
      </form>

      {/* Sort Options */}
      <div className="sort-section mb-4">
        <div className="d-flex align-items-center flex-wrap">
          <span className="me-3 fw-medium">Sort by:</span>
          <div className="btn-group" role="group">
            <button className={getSortButtonClass('recent')} onClick={() => handleSortChange('recent')}>
              <i className="fas fa-clock me-1"></i>
              Recent
            </button>
            <button className={getSortButtonClass('best')} onClick={() => handleSortChange('best')}>
              <i className="fas fa-thumbs-up me-1"></i>
              Best
            </button>
            <button className={getSortButtonClass('interesting')} onClick={() => handleSortChange('interesting')}>
              <i className="fas fa-fire me-1"></i>
              Interesting
            </button>
            <button className={getSortButtonClass('hot')} onClick={() => handleSortChange('hot')}>
              <i className="fas fa-bolt me-1"></i>
              Hot
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchParams.get('search') && (
        <div className="alert alert-info mb-4">
          <i className="fas fa-search me-2"></i>
          Search results for: <strong>{searchParams.get('search')}</strong>
          <button
            className="btn btn-sm btn-outline-primary ms-2"
            onClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete('search');
              newSearchParams.delete('page');
              setSearchParams(newSearchParams);
              setSearchInput('');
              setCurrentPage(1);
              loadQuestions();
            }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading questions...</p>
        </div>
      )}

      {/* Questions List */}
      {!isLoading && (
        <>
          {questions.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="fas fa-question-circle fa-4x text-muted"></i>
              </div>
              <h3>No questions found</h3>
              <p className="text-muted">
                {searchParams.get('search')
                  ? `No questions match "${searchParams.get('search')}". Try different keywords.`
                  : 'Be the first to ask a question!'
                }
              </p>
              {currentUser && (
                <button
                  className="btn btn-primary"
                  onClick={showCreateQuestion}
                >
                  <i className="fas fa-plus me-1"></i>
                  Ask the First Question
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="questions-list">
                {questions.map(question => (
                  <QuestionCard
                    key={question.question_id}
                    question={question}
                    currentUser={currentUser}
                    onShowMessage={onShowMessage}
                    // Add tag click handler
                    onTagClick={tag => {
                      // When a tag is clicked, add it to the search bar as #tag
                      let newSearch = searchInput;
                      if (!newSearch.includes(`#${tag}`)) {
                        newSearch = `${newSearch} #${tag}`.trim();
                      }
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('search', newSearch);
                      newSearchParams.delete('page');
                      setSearchParams(newSearchParams);
                      setSearchInput(newSearch);
                      setCurrentPage(1);
                      loadQuestions();
                    }}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={allQuestions.length}
                itemsPerPage={QUESTIONS_PER_PAGE}
                onPageChange={handlePageChange}
                maxVisiblePages={5}
              />
            </>
          )}
        </>
      )}

      {/* Question Creation Modal */}
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

// // source/src/views/BuffetView.js - FIXED VERSION
// import React, { useState, useEffect } from 'react';
// import { Link, useSearchParams, useNavigate } from 'react-router-dom';
// import QuestionCard from '../components/questions/QuestionCard';
// import QuestionModal from '../components/questions/QuestionModal';
// import { searchQuestions } from '../services/questions';

// const BuffetView = ({ currentUser, onShowMessage, setLoading }) => {
//   const [questions, setQuestions] = useState([]);
//   const [sortType, setSortType] = useState('recent');
//   const [showQuestionModal, setShowQuestionModal] = useState(false);
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
  
//   // FIXED: Only depend on sortType to prevent loops
//   useEffect(() => {
//     loadQuestions();
//   }, [sortType]);

//   // FIXED: Remove useCallback to prevent dependency issues
//   const loadQuestions = async () => {
//     setLoading(true);
//     try {
//       const searchQuery = searchParams.get('search');
//       const response = await searchQuestions({
//         sort: getSortParameter(sortType),
//         search: searchQuery
//       });
      
//       if (response.success) {
//         setQuestions(response.questions || []);
        
//         if (response.questions?.length === 0) {
//           onShowMessage('No questions found', 'info');
//         }
//       } else {
//         onShowMessage('Failed to load questions', 'error');
//         // Fallback to sample data for development
//         setQuestions(getSampleQuestions());
//       }
//     } catch (error) {
//       console.error('Error loading questions:', error);
      
//       // Handle specific API errors
//       if (error.response?.status === 401) {
//         onShowMessage('API authentication failed. Check your API key.', 'error');
//       } else if (error.response?.status === 429) {
//         onShowMessage('Too many requests. Please wait a moment.', 'error');
//       } else if (error.response?.status === 555) {
//         onShowMessage('API returned temporary error (this is expected behavior)', 'info');
//       } else {
//         onShowMessage('Error loading questions. Using sample data.', 'error');
//       }
      
//       // Show sample data as fallback
//       setQuestions(getSampleQuestions());
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getSortParameter = (sortType) => {
//     switch (sortType) {
//       case 'best': return 'u';
//       case 'interesting': return 'uvc';
//       case 'hot': return 'uvac';
//       default: return ''; // recent (default)
//     }
//   };

//   const getSampleQuestions = () => [
//     {
//       question_id: '1',
//       title: 'How to implement authentication in React?',
//       text: 'I am trying to implement user authentication in my React application...',
//       creator: 'user123',
//       createdAt: Date.now() - 7200000, // 2 hours ago
//       upvotes: 5,
//       downvotes: 0,
//       answers: 3,
//       views: 25,
//       status: 'open'
//     },
//     {
//       question_id: '2', 
//       title: 'Best practices for API integration',
//       text: 'What are the best practices when integrating with REST APIs...',
//       creator: 'developer456',
//       createdAt: Date.now() - 14400000, // 4 hours ago
//       upvotes: 8,
//       downvotes: 1,
//       answers: 5,
//       views: 42,
//       status: 'open'
//     }
//   ];

//   const handleSortChange = (newSortType) => {
//     setSortType(newSortType);
//     // Update active button styling
//     document.querySelectorAll('.sort-btn').forEach(btn => {
//       btn.classList.remove('active');
//     });
//     document.querySelector(`[data-sort="${newSortType}"]`)?.classList.add('active');
//   };

//   const showCreateQuestion = () => {
//     if (!currentUser) {
//       onShowMessage('Please log in to ask a question', 'error');
//       return;
//     }
    
//     // Option 1: Navigate to dedicated page
//     navigate('/create-question');
    
//     // Option 2: Show modal (uncomment to use modal instead)
//     // setShowQuestionModal(true);
//   };

//   const handleQuestionCreated = () => {
//     // Refresh questions list after new question is created
//     loadQuestions();
//     setShowQuestionModal(false);
//   };

//   return (
//     <div className="buffet-view">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Latest Questions</h2>
//         <button 
//           className="btn btn-primary" 
//           onClick={showCreateQuestion}
//         >
//           Ask Question
//         </button>
//       </div>

//       {/* Sort Options */}
//       <div className="mb-3">
//         <div className="btn-group" role="group">
//           <button 
//             className={`btn btn-outline-secondary sort-btn ${sortType === 'recent' ? 'active' : ''}`}
//             data-sort="recent"
//             onClick={() => handleSortChange('recent')}
//           >
//             Most Recent
//           </button>
//           <button 
//             className={`btn btn-outline-secondary sort-btn ${sortType === 'best' ? 'active' : ''}`}
//             data-sort="best"
//             onClick={() => handleSortChange('best')}
//           >
//             Best Questions
//           </button>
//           <button 
//             className={`btn btn-outline-secondary sort-btn ${sortType === 'interesting' ? 'active' : ''}`}
//             data-sort="interesting"
//             onClick={() => handleSortChange('interesting')}
//           >
//             Most Interesting
//           </button>
//           <button 
//             className={`btn btn-outline-secondary sort-btn ${sortType === 'hot' ? 'active' : ''}`}
//             data-sort="hot"
//             onClick={() => handleSortChange('hot')}
//           >
//             Hottest
//           </button>
//         </div>
//       </div>

//       {/* Search Results Info */}
//       {searchParams.get('search') && (
//         <div className="alert alert-info">
//           Search results for: <strong>{searchParams.get('search')}</strong>
//         </div>
//       )}

//       {/* Questions List */}
//       <div className="questions-list">
//         {questions.length === 0 ? (
//           <div className="text-center py-5">
//             <h5>No questions found</h5>
//             <p className="text-muted">Be the first to ask a question!</p>
//           </div>
//         ) : (
//           questions.map(question => (
//             <QuestionCard 
//               key={question.question_id} 
//               question={question}
//               currentUser={currentUser}
//               onShowMessage={onShowMessage}
//             />
//           ))
//         )}
//       </div>

//       {/* Pagination (implement later) */}
//       <nav aria-label="Questions pagination" className="mt-4">
//         <ul className="pagination justify-content-center">
//           <li className="page-item disabled">
//             <span className="page-link">Previous</span>
//           </li>
//           <li className="page-item active">
//             <span className="page-link">1</span>
//           </li>
//           <li className="page-item">
//             <Link className="page-link" to="/?page=2">2</Link>
//           </li>
//           <li className="page-item">
//             <Link className="page-link" to="/?page=3">3</Link>
//           </li>
//           <li className="page-item">
//             <Link className="page-link" to="/?page=2">Next</Link>
//           </li>
//         </ul>
//       </nav>

//       {/* Question Creation Modal (if using modal option) */}
//       <QuestionModal
//         show={showQuestionModal}
//         onClose={() => setShowQuestionModal(false)}
//         currentUser={currentUser}
//         onShowMessage={onShowMessage}
//         setLoading={setLoading}
//       />
//     </div>
//   );
// };

// export default BuffetView;