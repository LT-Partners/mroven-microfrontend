import React from 'react';
import './pageNotFound.css';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleNotFound = () => {
    const brandSelected = localStorage.getItem('brandSelected');
    navigate(`/profile/${brandSelected}/${brandSelected}`);
  };

  return (
    <div id="main">
      <div className="fof">
        <h1>Error 404</h1>
        <button onClick={handleNotFound}>Go to Profile</button>
      </div>
    </div>
  );
};

export default PageNotFound;
