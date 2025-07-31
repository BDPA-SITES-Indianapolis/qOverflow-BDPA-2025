// source/src/components/questions/QuestionCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import VoteButtons from './VoteButtons';
import { getGravatarUrl, formatTimeAgo, getUserLevel } from '../../utils/helpers';

const QuestionCard = ({ question, currentUser, onShowMessage }) => {
  const {
    question_id,
    title,
    text,
    creator,
    createdAt,
    upvotes,
    downvotes,
    answers,
    views,
    status
  } = question;

  const netVotes = upvotes - downvotes;
  const userLevel = getUserLevel(1); // get user points from API
  const timeAgo = formatTimeAgo(createdAt);

  return (
    <div className="card question-card mb-3">
      <div className="card-body">
        <div className="d-flex">
          <VoteButtons
            itemType="question"
            itemId={question_id}
            upvotes={upvotes}
            downvotes={downvotes}
            currentUser={currentUser}
            onShowMessage={onShowMessage}
          />
          
          <div className="flex-grow-1">
            <h5 className="card-title">
              <Link 
                to={`/question/${question_id}`}
                className="text-decoration-none"
              >
                {title}
              </Link>
              {status !== 'open' && (
                <span className={`badge ms-2 ${
                  status === 'closed' ? 'bg-danger' : 'bg-warning'
                }`}>
                  {status.toUpperCase()}
                </span>
              )}
            </h5>
            
            <p className="card-text text-muted">
              {text.length > 150 ? text.substring(0, 150) + '...' : text}
            </p>
            
            <div className="d-flex justify-content-between align-items-center">
              <div className="question-meta">
                <span className="badge bg-secondary me-2">
                  {answers} answer{answers !== 1 ? 's' : ''}
                </span>
                <span className="badge bg-info me-2">
                  {views} view{views !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="question-author d-flex align-items-center">
                <img 
                  src={getGravatarUrl(creator + '@example.com')} 
                  alt={`${creator} avatar`}
                  className="user-avatar me-2"
                  onError={(e) => {
                    e.target.src = getGravatarUrl('default@example.com');
                  }}
                />
                <span className="text-muted">
                  {creator} • Level {userLevel} • {timeAgo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;