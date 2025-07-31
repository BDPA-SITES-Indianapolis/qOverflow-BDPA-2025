// source/src/utils/validation.js
// Form validation utilities for qOverflow

// ========================
// USER VALIDATION
// ========================

// Validate username (alphanumeric, dashes, underscores only)
export const validateUsername = (username) => {
    const errors = [];
    
    if (!username) {
      errors.push('Username is required');
      return errors;
    }
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters');
    }
    
    // Check for valid characters (alphanumeric, dashes, underscores)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      errors.push('Username can only contain letters, numbers, dashes, and underscores');
    }
    
    return errors;
  };
  
  // Validate email format
  export const validateEmail = (email) => {
    const errors = [];
    
    if (!email) {
      errors.push('Email is required');
      return errors;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  };
  
  // Validate password strength
  export const validatePassword = (password) => {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
      return errors;
    }
    
    if (password.length <= 10) {
      errors.push('Password is weak - must be more than 10 characters');
    }
    
    // Additional password requirements could go here
    // e.g., requiring special characters, numbers, etc.
    
    return errors;
  };
  
  // Get password strength (for UI display)
  export const getPasswordStrength = (password) => {
    if (!password) {
      return { strength: 'none', score: 0, color: 'secondary' };
    }
    
    if (password.length <= 10) {
      return { 
        strength: 'weak', 
        score: 1, 
        color: 'danger',
        message: 'Weak password - needs more than 10 characters'
      };
    } else if (password.length <= 17) {
      return { 
        strength: 'moderate', 
        score: 2, 
        color: 'warning',
        message: 'Moderate password strength'
      };
    } else {
      return { 
        strength: 'strong', 
        score: 3, 
        color: 'success',
        message: 'Strong password'
      };
    }
  };
  
  // ========================
  // CONTENT VALIDATION
  // ========================
  
  // Validate question title
  export const validateQuestionTitle = (title) => {
    const errors = [];
    
    if (!title || !title.trim()) {
      errors.push('Question title is required');
      return errors;
    }
    
    const trimmedTitle = title.trim();
    
    if (trimmedTitle.length < 10) {
      errors.push('Title must be at least 10 characters');
    }
    
    if (trimmedTitle.length > 150) {
      errors.push('Title must be no more than 150 characters');
    }
    
    return errors;
  };
  
  // Validate question/answer body
  export const validateQuestionBody = (body) => {
    const errors = [];
    
    if (!body || !body.trim()) {
      errors.push('Question details are required');
      return errors;
    }
    
    const trimmedBody = body.trim();
    
    if (trimmedBody.length < 20) {
      errors.push('Question details must be at least 20 characters');
    }
    
    if (trimmedBody.length > 3000) {
      errors.push('Question details must be no more than 3000 characters');
    }
    
    return errors;
  };
  
  // Validate answer body
  export const validateAnswerBody = (body) => {
    const errors = [];
    
    if (!body || !body.trim()) {
      errors.push('Answer is required');
      return errors;
    }
    
    const trimmedBody = body.trim();
    
    if (trimmedBody.length < 20) {
      errors.push('Answer must be at least 20 characters');
    }
    
    if (trimmedBody.length > 3000) {
      errors.push('Answer must be no more than 3000 characters');
    }
    
    return errors;
  };
  
  // Validate comment
  export const validateComment = (comment) => {
    const errors = [];
    
    if (!comment || !comment.trim()) {
      errors.push('Comment cannot be empty');
      return errors;
    }
    
    const trimmedComment = comment.trim();
    
    if (trimmedComment.length > 150) {
      errors.push('Comment must be no more than 150 characters');
    }
    
    return errors;
  };
  
  // ========================
  // MAIL VALIDATION
  // ========================
  
  // Validate mail subject
  export const validateMailSubject = (subject) => {
    const errors = [];
    
    if (!subject || !subject.trim()) {
      errors.push('Subject is required');
      return errors;
    }
    
    if (subject.trim().length > 75) {
      errors.push('Subject must be no more than 75 characters');
    }
    
    return errors;
  };
  
  // Validate mail body
  export const validateMailBody = (body) => {
    const errors = [];
    
    if (!body || !body.trim()) {
      errors.push('Message body is required');
      return errors;
    }
    
    if (body.trim().length > 150) {
      errors.push('Message must be no more than 150 characters');
    }
    
    return errors;
  };
  
  // ========================
  // CAPTCHA VALIDATION
  // ========================
  
  // Simple math CAPTCHA for registration
  export const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let question, answer;
    
    switch (operator) {
      case '+':
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller}`;
        answer = larger - smaller;
        break;
      case '*':
        // Use smaller numbers for multiplication
        const small1 = Math.floor(Math.random() * 5) + 1;
        const small2 = Math.floor(Math.random() * 5) + 1;
        question = `${small1} × ${small2}`;
        answer = small1 * small2;
        break;
      default:
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
    }
    
    return { question, answer };
  };
  
  // Validate CAPTCHA answer
  export const validateCaptcha = (userAnswer, correctAnswer) => {
    const errors = [];
    
    if (!userAnswer && userAnswer !== 0) {
      errors.push('Please solve the math problem');
      return errors;
    }
    
    const numericAnswer = parseInt(userAnswer, 10);
    
    if (isNaN(numericAnswer)) {
      errors.push('Please enter a valid number');
      return errors;
    }
    
    if (numericAnswer !== correctAnswer) {
      errors.push('Incorrect answer. Please try again.');
      return errors;
    }
    
    return errors;
  };
  
  // ========================
  // FORM HELPERS
  // ========================
  
  // Check if form has errors
  export const hasErrors = (validationResults) => {
    return Object.values(validationResults).some(errors => errors.length > 0);
  };
  
  // Get first error message
  export const getFirstError = (validationResults) => {
    for (const errors of Object.values(validationResults)) {
      if (errors.length > 0) {
        return errors[0];
      }
    }
    return null;
  };
  
  // Validate entire registration form
  export const validateRegistrationForm = (formData) => {
    return {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      captcha: validateCaptcha(formData.captchaAnswer, formData.correctCaptchaAnswer)
    };
  };
  
  // Validate login form
  export const validateLoginForm = (formData) => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = ['Username is required'];
    }
    
    if (!formData.password) {
      errors.password = ['Password is required'];
    }
    
    return errors;
  };
  
  // Validate question form
  export const validateQuestionForm = (formData) => {
    return {
      title: validateQuestionTitle(formData.title),
      text: validateQuestionBody(formData.text)
    };
  };
  
  // Validate answer form
  export const validateAnswerForm = (formData) => {
    return {
      text: validateAnswerBody(formData.text)
    };
  };
  
  // Validate mail form
  export const validateMailForm = (formData) => {
    const validation = {
      receiver: !formData.receiver ? ['Recipient is required'] : [],
      subject: validateMailSubject(formData.subject),
      text: validateMailBody(formData.text)
    };
    
    // Additional validation for receiver (should be valid username)
    if (formData.receiver) {
      const usernameErrors = validateUsername(formData.receiver);
      if (usernameErrors.length > 0) {
        validation.receiver = ['Please enter a valid username'];
      }
    }
    
    return validation;
  };
  
  export default {
    validateUsername,
    validateEmail,
    validatePassword,
    getPasswordStrength,
    validateQuestionTitle,
    validateQuestionBody,
    validateAnswerBody,
    validateComment,
    validateMailSubject,
    validateMailBody,
    generateCaptcha,
    validateCaptcha,
    hasErrors,
    getFirstError,
    validateRegistrationForm,
    validateLoginForm,
    validateQuestionForm,
    validateAnswerForm,
    validateMailForm
  };