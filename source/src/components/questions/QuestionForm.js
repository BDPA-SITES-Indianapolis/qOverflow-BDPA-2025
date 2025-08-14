// source/src/components/questions/QuestionForm.js 

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuestion } from '../../services/questions';
import MarkdownEditor from '../common/MarkdownEditor';

const QuestionForm = ({ currentUser, onShowMessage, setLoading, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    tags: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if user can ask questions
  useEffect(() => {
    if (!currentUser) {
      onShowMessage('Please log in to ask a question', 'error');
      if (onCancel) onCancel();
      return;
    }
  }, [currentUser, onShowMessage, onCancel]);

  // Add to characterCounts
  const characterCounts = {
    title: formData.title.length,
    text: formData.text.length,
    tags: formData.tags.length
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Question title is required';
    } else if (formData.title.length > 150) {
      newErrors.title = 'Title must be 150 characters or less';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    // Body validation  
    if (!formData.text.trim()) {
      newErrors.text = 'Question body is required';
    } else if (formData.text.length > 3000) {
      newErrors.text = 'Question body must be 3000 characters or less';
    } else if (formData.text.length < 20) {
      newErrors.text = 'Question body must be at least 20 characters';
    }

    // Tag validation
    const tagsArr = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (!formData.tags.trim()) {
      newErrors.tags = 'At least one tag is required';
    } else if (tagsArr.length > 5) {
      newErrors.tags = 'No more than 5 tags allowed';
    } else if (tagsArr.some(tag => tag.length < 2 || tag.length > 15)) {
      newErrors.tags = 'Each tag must be 2-15 characters';
    } else if (formData.tags.length > 25) {
      newErrors.tags = 'Tags cannot be more than 25 characters total';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTextChange = (value) => {
    setFormData(prev => ({
      ...prev,
      text: value
    }));

    // Clear text error when user starts typing
    if (errors.text) {
      setErrors(prev => ({
        ...prev,
        text: ''
      }));
    }
  };
//handleTagChange might be useless idk
  const handleTagChange = (value) => {
    setFormData(prev => ({
        ...prev,
        tags: value
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      onShowMessage('Please fix the errors below', 'error');
      return;
    }

    if (!currentUser) {
      onShowMessage('Please log in to ask a question', 'error');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await createQuestion({
        creator: currentUser.username,
        title: formData.title.trim(),
        text: formData.text.trim(),
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      });

      if (response.success) {
        onShowMessage('Question posted successfully!', 'success');
        
        // Navigate to the new question
        navigate(`/question/${response.question.question_id}`);
        
        // Or if onCancel is provided (modal mode), close the form
        if (onCancel) {
          onCancel();
        }
      } else {
        onShowMessage('Failed to post question', 'error');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      
      if (error.response?.status === 401) {
        onShowMessage('Please log in again', 'error');
      } else if (error.response?.status === 413) {
        onShowMessage('Question is too large', 'error');
      } else if (error.response?.status === 429) {
        onShowMessage('Too many requests. Please wait a moment.', 'error');
      } else {
        onShowMessage('Failed to post question. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // If user is not logged in, show message and disable form

  if (!currentUser) {
    return (
      <div className="alert alert-warning">
        <h5>Login Required</h5>
        <p>You must be logged in to ask a question.</p>
      </div>
    );
  }

  return (
    <div className="question-form">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Ask a Question</h4>
          {onCancel && (
            <button 
              type="button" 
              className="btn-close" 
              onClick={onCancel}
              disabled={isSubmitting}
            ></button>
          )}
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Question Title */}
            <div className="mb-3">
              <label htmlFor="questionTitle" className="form-label">
                Question Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                id="questionTitle"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What's your programming question? Be specific."
                maxLength={150}
                disabled={isSubmitting}
              />
              <div className="form-text">
                <span className={characterCounts.title > 150 ? 'text-danger' : 'text-muted'}>
                  {characterCounts.title}/150 characters
                </span>
              </div>
              {errors.title && (
                <div className="invalid-feedback">{errors.title}</div>
              )}
            </div>

            {/* Question Body with Markdown */}
            <div className="mb-3">
              <label htmlFor="questionText" className="form-label">
                Question Details <span className="text-danger">*</span>
              </label>
              <MarkdownEditor
                value={formData.text}
                onChange={handleTextChange}
                placeholder="Describe your problem in detail. You can use Markdown formatting."
                maxLength={3000}
                disabled={isSubmitting}
                error={errors.text}
              />
              <div className="form-text">
                <span className={characterCounts.text > 3000 ? 'text-danger' : 'text-muted'}>
                  {characterCounts.text}/3000 characters
                </span>
                <span className="ms-3 text-muted">
                  Supports <strong>Markdown</strong> formatting
                </span>
              </div>
              {errors.text && (
                <div className="text-danger mt-1">{errors.text}</div>
              )}
            </div>

            {/* Tags Input */}
            <div className="mb-3">
              <label htmlFor="questionTags" className="form-label">
                Tags <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.tags ? 'is-invalid' : ''}`}
                id="questionTags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g. javascript, react, api"
                maxLength={25}
                disabled={isSubmitting}
              />
              <div className="form-text">
                <span className={characterCounts.tags > 25 ? 'text-danger' : 'text-muted'}>
                  {characterCounts.tags}/25 characters
                </span>
                <span className="ms-3 text-muted">
                  Separate tags with commas (max 3 tags)
                </span>
              </div>
              {errors.tags && (
                <div className="invalid-feedback">{errors.tags}</div>
              )}
            </div>

            {/* Posting Guidelines */}
            <div className="alert alert-info">
              <h6>Posting Guidelines:</h6>
              <ul className="mb-0">
                <li>Be specific and clear in your question title</li>
                <li>Provide enough detail for others to understand your problem</li>
                <li>Include relevant code, error messages, or screenshots</li>
                <li>Search existing questions before posting</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.title.trim() || !formData.text.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Posting Question...
                  </>
                ) : (
                  'Post Your Question'
                )}
              </button>
              
              {onCancel && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFormData({ title: '', text: '' });
                  setErrors({});
                }}
                disabled={isSubmitting}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;