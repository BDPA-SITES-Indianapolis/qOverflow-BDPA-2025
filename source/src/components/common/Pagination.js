// source/src/components/common/Pagination.js
import React from 'react';
import { Link } from 'react-router-dom';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  maxVisiblePages = 5 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showFirstPage = visiblePages[0] > 1;
  const showLastPage = visiblePages[visiblePages.length - 1] < totalPages;
  const showPrevEllipsis = visiblePages[0] > 2;
  const showNextEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  return (
    <nav aria-label="Questions pagination" className="mt-4">
      <ul className="pagination justify-content-center">
        {/* Previous Button */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          {currentPage === 1 ? (
            <span className="page-link">
              <i className="fas fa-chevron-left me-1"></i>
              Previous
            </span>
          ) : (
            <button 
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
            >
              <i className="fas fa-chevron-left me-1"></i>
              Previous
            </button>
          )}
        </li>

        {/* First Page */}
        {showFirstPage && (
          <>
            <li className="page-item">
              <button 
                className="page-link"
                onClick={() => onPageChange(1)}
              >
                1
              </button>
            </li>
            {showPrevEllipsis && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}

        {/* Visible Page Numbers */}
        {visiblePages.map(pageNumber => (
          <li 
            key={pageNumber} 
            className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
          >
            {currentPage === pageNumber ? (
              <span className="page-link">
                {pageNumber}
                <span className="visually-hidden">(current)</span>
              </span>
            ) : (
              <button 
                className="page-link"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            )}
          </li>
        ))}

        {/* Last Page */}
        {showLastPage && (
          <>
            {showNextEllipsis && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button 
                className="page-link"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Next Button */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          {currentPage === totalPages ? (
            <span className="page-link">
              Next
              <i className="fas fa-chevron-right ms-1"></i>
            </span>
          ) : (
            <button 
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
              <i className="fas fa-chevron-right ms-1"></i>
            </button>
          )}
        </li>
      </ul>
      
      {/* Page Info */}
      <div className="text-center mt-2">
        <small className="text-muted">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} questions
        </small>
      </div>
    </nav>
  );
};

export default Pagination;