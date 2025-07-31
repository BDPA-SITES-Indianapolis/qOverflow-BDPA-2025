// source/src/components/answers/AnswerCard.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoteButtons from '../questions/VoteButtons';
import CommentSection from '../comments/CommentSection';
import { getGravatarUrlSync, formatTimeAgo, getUserLevel } from '../../utils/helpers';

const AnswerCard = ({ 
  answer, 
  questionId,
  currentUser, 
  canAccept, 
  canComment,
  onShowMessage, 
  onAccept, 
  onUpdate,
  isLast = false
}) => {
  const {
    answer_id,
    creator,
    createdAt,
    text,
    upvotes,
    downvotes,
    accepted
  } = answer;

  const netVotes = upvotes - downvotes;
  const isOwnAnswer = currentUser && currentUser.username === creator;

  const handleAcceptAnswer = () => {
    if (canAccept && onAccept) {
      onAccept();
    }
  };

  return (
    <div className={`answer-card ${accepted ? 'accepted-answer' : ''} ${!isLast ? 'border-bottom' : ''}`}>
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex">
            {/* Vote Buttons */}
            <div className="me-3 d-flex flex-column align-items-center">
              <VoteButtons
                itemType="answer"
                itemId={answer_id}
                questionId={questionId}
                upvotes={upvotes}
                downvotes={downvotes}
                currentUser={currentUser}
                onShowMessage={onShowMessage}
              />
              
              {/* Accept Answer Button */}
              {canAccept && !accepted && (
                <button
                  className="btn btn-outline-success btn-sm mt-2"
                  onClick={handleAcceptAnswer}
                  title="Accept this answer"
                >
                  <i className="fas fa-check"></i>
                </button>
              )}
              
              {/* Accepted Answer Indicator */}
              {accepted && (
                <div className="accepted-indicator mt-2 text-center">
                  <i className="fas fa-check-circle text-success fs-4" title="Accepted Answer"></i>
                  <small className="d-block text-success fw-bold">Accepted</small>
                </div>
              )}
            </div>

            {/* Answer Content */}
            <div className="flex-grow-1">
              {/* Accepted Answer Badge */}
              {accepted && (
                <div className="accepted-badge mb-2">
                  <span className="badge bg-success">
                    <i className="fas fa-check me-1"></i>
                    Accepted Answer
                  </span>
                </div>
              )}

              {/* Answer Text */}
              <div className="answer-text mb-3">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({node, inline, className, children, ...props}) => {
                      return inline ? (
                        <code className="bg-light px-1 rounded" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-light p-2 rounded">
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    },
                    blockquote: ({children}) => (
                      <blockquote className="border-start border-3 ps-3 text-muted">
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>

              {/* Answer Author and Actions */}
              <div className="d-flex justify-content-between align-items-end">
                <div className="answer-actions">
                  {/* Action buttons could go here (edit, delete, etc.) */}
                </div>
                
                <div className="answer-author d-flex align-items-center">
                  <img
                    src={getGravatarUrlSync(creator + '@example.com')}
                    alt={`${creator} avatar`}
                    className="user-avatar me-2"
                  />
                  <div>
                    <div className="fw-medium">
                      {creator}
                      {isOwnAnswer && (
                        <small className="text-muted ms-1">(you)</small>
                      )}
                    </div>
                    <small className="text-muted">
                      Level {getUserLevel(1)} • answered {formatTimeAgo(createdAt)}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments on Answer */}
      <div className="ms-5">
        <CommentSection
          parentType="answer"
          parentId={answer_id}
          questionId={questionId}
          currentUser={currentUser}
          canComment={canComment || isOwnAnswer}
          onShowMessage={onShowMessage}
        />
      </div>
    </div>
  );
};

export default AnswerCard;