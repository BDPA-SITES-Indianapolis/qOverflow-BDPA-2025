// source/src/components/answers/AnswerForm.js
import React, { useState } from 'react';
import { createAnswer } from '../../services/questions';
import MarkdownEditor from '../common/MarkdownEditor';
import { getUserLevel } from '../../utils/helpers';

const AnswerForm = ({ 
  questionId, 
  currentUser, 
  onShowMessage, 
  setLoading, 
  onCancel,
  onSuccess 
}) => {
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const userLevel = getUserLevel(currentUser?.points || 1);
  const canAnswer = userLevel >= 1;

  const validateAnswer = () => {
    if (!answerText.trim()) {
      setError('Answer cannot be empty');
      return false;
    }
    
    if (answerText.length < 20) {
      setError('Answer must be at least 20 characters');
      return false;
    }
    
    if (answerText.length > 3000) {
      setError('Answer must be 3000 characters or less');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAnswer()) {
      onShowMessage('Please fix the errors below', 'error');
      return;
    }

    if (!currentUser) {
      onShowMessage('Please log in to answer', 'error');
      return;
    }

    if (!canAnswer) {
      onShowMessage('You need Level 1 (1 point) to post answers', 'error');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await createAnswer(questionId, {
        creator: currentUser.username,
        text: answerText.trim()
      });

      if (response.success) {
        // Create answer object for immediate UI update
        const newAnswer = {
          answer_id: response.answer.answer_id,
          question_id: questionId,
          creator: currentUser.username,
          createdAt: Date.now(),
          text: answerText.trim(),
          upvotes: 0,
          downvotes: 0,
          accepted: false,
          ...response.answer
        };

        if (onSuccess) {
          onSuccess(newAnswer);
        }

        onShowMessage('Answer posted successfully!', 'success');
        setAnswerText('');
      } else {
        onShowMessage('Failed to post answer', 'error');
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      
      if (error.response?.status === 401) {
        onShowMessage('Please log in again', 'error');
      } else if (error.response?.status === 403) {
        onShowMessage('Insufficient privileges to post answers', 'error');
      } else if (error.response?.status === 413) {
        onShowMessage('Answer is too large', 'error');
      } else if (error.response?.status === 429) {
        onShowMessage('Too many requests. Please wait a moment.', 'error');
      } else {
        onShowMessage('Failed to post answer. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleTextChange = (value) => {
    setAnswerText(value);
    if (error) {
      setError('');
    }
  };

  if (!currentUser) {
    return (
      <div className="alert alert-warning">
        <h6>Login Required</h6>
        <p>You must be logged in to post an answer.</p>
      </div>
    );
  }

  if (!canAnswer) {
    return (
      <div className="alert alert-info">
        <h6>Level 1 Required</h6>
        <p>You need Level 1 (1 point) to post answers. You currently have {currentUser.points || 1} points.</p>
      </div>
    );
  }

  return (
    <div className="answer-form">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Your Answer</h5>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <MarkdownEditor
                value={answerText}
                onChange={handleTextChange}
                placeholder="Write your answer here. You can use Markdown formatting to include code, links, and formatting."
                maxLength={3000}
                disabled={isSubmitting}
                error={error}
              />
              
              <div className="form-text d-flex justify-content-between">
                <span className={answerText.length > 3000 ? 'text-danger' : 'text-muted'}>
                  {answerText.length}/3000 characters
                </span>
                <span className="text-muted">
                  Supports <strong>Markdown</strong> formatting
                </span>
              </div>
              
              {error && (
                <div className="text-danger mt-1">{error}</div>
              )}
            </div>

            {/* Answer Guidelines */}
            <div className="alert alert-info">
              <h6>Answer Guidelines:</h6>
              <ul className="mb-0">
                <li>Provide a clear and comprehensive answer</li>
                <li>Include code examples when relevant</li>
                <li>Explain your reasoning and approach</li>
                <li>Be respectful and constructive</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !answerText.trim() || answerText.length < 20}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Posting Answer...
                  </>
                ) : (
                  'Post Your Answer'
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setAnswerText('');
                  setError('');
                }}
                disabled={isSubmitting}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnswerForm;