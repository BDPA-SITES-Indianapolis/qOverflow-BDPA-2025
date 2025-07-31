// source/src/services/comments.js
import api from './api';

// Get comments for a question or answer
export const getComments = async (parentType, parentId, questionId = null) => {
  try {
    let url;
    
    if (parentType === 'question') {
      url = `/questions/${parentId}/comments`;
    } else if (parentType === 'answer') {
      url = `/questions/${questionId}/answers/${parentId}/comments`;
    } else {
      throw new Error('Invalid parent type');
    }
    
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Create a new comment
export const createComment = async (parentType, parentId, questionId, commentData) => {
  try {
    let url;
    
    if (parentType === 'question') {
      url = `/questions/${parentId}/comments`;
    } else if (parentType === 'answer') {
      url = `/questions/${questionId}/answers/${parentId}/comments`;
    } else {
      throw new Error('Invalid parent type');
    }
    
    const response = await api.post(url, commentData);
    return response;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (parentType, parentId, questionId, commentId) => {
  try {
    let url;
    
    if (parentType === 'question') {
      url = `/questions/${parentId}/comments/${commentId}`;
    } else if (parentType === 'answer') {  
      url = `/questions/${questionId}/answers/${parentId}/comments/${commentId}`;
    } else {
      throw new Error('Invalid parent type');
    }
    
    const response = await api.delete(url);
    return response;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
// // source/src/services/comments.js - Comments Service
// import api from './api';

// // Get comments for a question or answer
// export const getComments = async (parentType, parentId, questionId = null) => {
//   try {
//     let url;
    
//     if (parentType === 'question') {
//       url = `/questions/${parentId}/comments`;
//     } else if (parentType === 'answer') {
//       url = `/questions/${questionId}/answers/${parentId}/comments`;
//     } else {
//       throw new Error('Invalid parent type');
//     }
    
//     const response = await api.get(url);
//     return response;
//   } catch (error) {
//     console.error('Error getting comments:', error);
//     throw error;
//   }
// };

// // Create a new comment
// export const createComment = async (parentType, parentId, questionId, commentData) => {
//   try {
//     let url;
    
//     if (parentType === 'question') {
//       url = `/questions/${parentId}/comments`;
//     } else if (parentType === 'answer') {
//       url = `/questions/${questionId}/answers/${parentId}/comments`;
//     } else {
//       throw new Error('Invalid parent type');
//     }
    
//     const response = await api.post(url, commentData);
//     return response;
//   } catch (error) {
//     console.error('Error creating comment:', error);
//     throw error;
//   }
// };

// // Delete a comment
// export const deleteComment = async (parentType, parentId, questionId, commentId) => {
//   try {
//     let url;
    
//     if (parentType === 'question') {
//       url = `/questions/${parentId}/comments/${commentId}`;
//     } else if (parentType === 'answer') {  
//       url = `/questions/${questionId}/answers/${parentId}/comments/${commentId}`;
//     } else {
//       throw new Error('Invalid parent type');
//     }
    
//     const response = await api.delete(url);
//     return response;
//   } catch (error) {
//     console.error('Error deleting comment:', error);
//     throw error;
//   }
// };: 2,
//       downvotes: 0
//     },
//     {
//       comment_id: '2',
//       creator: 'coder456',
//       createdAt: Date.now() - 900000, // 15 min ago
//       text: 'This is a common issue. Make sure your imports are correct.',
//       upvotes