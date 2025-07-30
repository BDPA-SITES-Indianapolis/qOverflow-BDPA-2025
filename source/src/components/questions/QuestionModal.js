// source/src/components/questions/QuestionModal.js
import React from 'react';
import QuestionForm from './QuestionForm';

const QuestionModal = ({ show, onClose, currentUser, onShowMessage, setLoading }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <QuestionForm
            currentUser={currentUser}
            onShowMessage={onShowMessage}
            setLoading={setLoading}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;