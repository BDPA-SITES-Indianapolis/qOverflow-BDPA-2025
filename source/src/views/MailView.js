// source/src/views/MailView.js - Complete Mail System
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import MarkdownEditor from '../components/common/MarkdownEditor';
import { getGravatarUrl, formatTimeAgo } from '../utils/helpers';
import { validateMailForm } from '../utils/validation';
import api from '../services/api';

const MailView = ({ currentUser, onShowMessage, setLoading }) => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    receiver: '',
    subject: '',
    text: ''
  });
  const [composeErrors, setComposeErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load messages when component mounts
  useEffect(() => {
    if (currentUser) {
      loadMessages();
    }
  }, [currentUser]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/mail/${currentUser.username}`);
      
      if (response.success) {
        // Sort messages by newest first
        const sortedMessages = (response.messages || []).sort((a, b) => 
          b.createdAt - a.createdAt
        );
        setMessages(sortedMessages);
      } else {
        onShowMessage('Failed to load messages', 'error');
        setMessages(getSampleMessages());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      onShowMessage('Error loading messages. Showing sample data.', 'info');
      setMessages(getSampleMessages());
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleMessages = () => [
    {
      mail_id: '1',
      sender: 'admin',
      receiver: currentUser.username,
      subject: 'Welcome to qOverflow!',
      text: 'Welcome to our Q&A platform! Feel free to ask questions and help others.',
      createdAt: Date.now() - 86400000 // 1 day ago
    },
    {
      mail_id: '2',
      sender: 'moderator',
      receiver: currentUser.username,
      subject: 'Community Guidelines',
      text: 'Please review our **community guidelines** to ensure a positive experience for everyone.',
      createdAt: Date.now() - 172800000 // 2 days ago
    }
  ];

  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setComposeForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (composeErrors[name]) {
      setComposeErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTextChange = (value) => {
    setComposeForm(prev => ({
      ...prev,
      text: value
    }));

    if (composeErrors.text) {
      setComposeErrors(prev => ({
        ...prev,
        text: ''
      }));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const validation = validateMailForm(composeForm);
    const hasErrors = Object.keys(validation).some(key => validation[key]?.length > 0);

    if (hasErrors) {
      setComposeErrors(validation);
      onShowMessage('Please fix the errors below', 'error');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await api.post('/mail', {
        sender: currentUser.username,
        receiver: composeForm.receiver.trim(),
        subject: composeForm.subject.trim(),
        text: composeForm.text.trim()
      });

      if (response.success) {
        onShowMessage('Message sent successfully!', 'success');
        
        // Reset form
        setComposeForm({ receiver: '', subject: '', text: '' });
        setComposeErrors({});
        setShowCompose(false);
        
        // Reload messages
        loadMessages();
      } else {
        onShowMessage('Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.response?.status === 404) {
        onShowMessage('Recipient not found', 'error');
      } else if (error.response?.status === 413) {
        onShowMessage('Message too large', 'error');
      } else {
        onShowMessage('Failed to send message. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-5">
        <div className="card">
          <div className="card-body">
            <h3>Please log in to access mail</h3>
            <p className="text-muted">You need to be logged in to send and receive messages.</p>
            <Link to="/auth" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mail-view">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Private Messages</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCompose(true)}
        >
          <i className="fas fa-plus me-1"></i>
          Compose Message
        </button>
      </div>

      {/* Mail Interface */}
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="list-group">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              <i className="fas fa-inbox me-2"></i>
              Inbox
              <span className="badge bg-primary rounded-pill float-end">
                {messages.length}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          {/* Compose Message Modal */}
          {showCompose && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Compose Message</h5>
                <button 
                  className="btn-close"
                  onClick={() => {
                    setShowCompose(false);
                    setComposeForm({ receiver: '', subject: '', text: '' });
                    setComposeErrors({});
                  }}
                ></button>
              </div>
              <div className="card-body">
                <form onSubmit={handleSendMessage}>
                  {/* To Field */}
                  <div className="mb-3">
                    <label htmlFor="receiver" className="form-label">
                      To: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${composeErrors.receiver ? 'is-invalid' : ''}`}
                      id="receiver"
                      name="receiver"
                      value={composeForm.receiver}
                      onChange={handleComposeChange}
                      placeholder="Enter username"
                      disabled={isSubmitting}
                    />
                    {composeErrors.receiver && (
                      <div className="invalid-feedback">{composeErrors.receiver[0]}</div>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">
                      Subject: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${composeErrors.subject ? 'is-invalid' : ''}`}
                      id="subject"
                      name="subject"
                      value={composeForm.subject}
                      onChange={handleComposeChange}
                      placeholder="Enter subject"
                      maxLength={75}
                      disabled={isSubmitting}
                    />
                    <div className="form-text">
                      {composeForm.subject.length}/75 characters
                    </div>
                    {composeErrors.subject && (
                      <div className="invalid-feedback">{composeErrors.subject[0]}</div>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="mb-3">
                    <label htmlFor="messageText" className="form-label">
                      Message: <span className="text-danger">*</span>
                    </label>
                    <MarkdownEditor
                      value={composeForm.text}
                      onChange={handleTextChange}
                      placeholder="Type your message here..."
                      maxLength={150}
                      disabled={isSubmitting}
                      error={composeErrors.text?.[0]}
                    />
                    <div className="form-text">
                      {composeForm.text.length}/150 characters
                    </div>
                    {composeErrors.text && (
                      <div className="text-danger mt-1">{composeErrors.text[0]}</div>
                    )}
                  </div>

                  {/* Send Button */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || !composeForm.receiver.trim() || !composeForm.subject.trim() || !composeForm.text.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-1"></i>
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Message List */}
          {activeTab === 'inbox' && (
            <div className="inbox-content">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading messages...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-envelope fa-3x text-muted mb-3"></i>
                  <h5>No messages yet</h5>
                  <p className="text-muted">Your inbox is empty. Messages you receive will appear here.</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map(message => (
                    <div
                      key={message.mail_id}
                      className={`card mb-3 ${selectedMessage?.mail_id === message.mail_id ? 'border-primary' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedMessage(selectedMessage?.mail_id === message.mail_id ? null : message)}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <img
                                src={getGravatarUrl(message.sender + '@example.com')}
                                alt={`${message.sender} avatar`}
                                className="rounded-circle me-2"
                                width={32}
                                height={32}
                              />
                              <div>
                                <h6 className="mb-0">{message.subject}</h6>
                                <small className="text-muted">
                                  From: <strong>{message.sender}</strong> • {formatTimeAgo(message.createdAt)}
                                </small>
                              </div>
                            </div>
                            
                            {selectedMessage?.mail_id === message.mail_id && (
                              <div className="message-content mt-3 p-3 bg-light rounded">
                                <ReactMarkdown>
                                  {message.text}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                          
                          <i className={`fas fa-chevron-${selectedMessage?.mail_id === message.mail_id ? 'down' : 'right'} text-muted`}></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailView;