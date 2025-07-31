// source/src/views/CreateQuestionView.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionForm from '../components/questions/QuestionForm';

const CreateQuestionView = ({ currentUser, onShowMessage, setLoading }) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-question-view">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <QuestionForm
              currentUser={currentUser}
              onShowMessage={onShowMessage}
              setLoading={setLoading}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionView;