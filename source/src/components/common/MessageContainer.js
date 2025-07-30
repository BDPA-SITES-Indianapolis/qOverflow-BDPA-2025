// source/src/components/common/MessageContainer.js
import React from 'react';

const MessageContainer = ({ message }) => {
  if (!message.text) return null;

  const alertClass = message.type === 'error' ? 'error-message' : 
                    message.type === 'success' ? 'success-message' : 
                    'alert alert-info';

  return (
    <div className={alertClass}>
      {message.text}
    </div>
  );
};

export default MessageContainer;