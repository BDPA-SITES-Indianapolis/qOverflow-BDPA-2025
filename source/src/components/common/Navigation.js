import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGravatarUrl } from '../../utils/helpers';

const Navigation = ({ currentUser, onLogout, onShowMessage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results (implement search functionality)
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      onShowMessage(`Searching for: ${searchQuery}`, 'info');
    }
  };

  const getUserLevel = (points = 1) => {
    if (points >= 10000) return 7;
    if (points >= 3000) return 6;
    if (points >= 1000) return 5;
    if (points >= 125) return 4;
    if (points >= 50) return 3;
    if (points >= 15) return 2;
    return 1;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark nav-header">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src="./bdpa-logo.png" 
            alt="BDPA Logo" 
            width="40" 
            height="40" 
            className="me-2"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          qOverflow
        </Link>

        <div className="navbar-nav ms-auto d-flex align-items-center">
          {/* Search Bar */}
          <div className="search-container me-3">
            <form onSubmit={handleSearch} className="d-flex">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-outline-light" type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>

          {/* Guest Navigation */}
          {!currentUser && (
            <div className="d-flex align-items-center">
              <Link to="/auth" className="btn btn-outline-light me-2">
                Login
              </Link>
              <Link to="/auth" className="btn btn-light">
                Sign Up
              </Link>
            </div>
          )}

          {/* Authenticated User Navigation */}
          {currentUser && (
            <div className="d-flex align-items-center">
              <img 
                src={getGravatarUrl(currentUser.email)} 
                alt="User Avatar" 
                className="user-avatar me-2"
              />
              <span className="user-level me-2">
                Level {getUserLevel(currentUser.points)}
              </span>
              <span className="points-display me-3">
                {currentUser.points || 1} pts
              </span>
              <Link to="/dashboard" className="btn btn-outline-light me-2">
                Dashboard
              </Link>
              <Link to="/mail" className="btn btn-outline-light me-2">
                Mail
              </Link>
              <button className="btn btn-outline-light" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;