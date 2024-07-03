import React from 'react';
import { Link } from 'react-router-dom';

const Test = () => {
 
  return (
    <div style={{backgroundColor: '#0F0D0E'}}>
       <Link to={`/`}>Home</Link>
      <h1 style={{color: 'lightgreen'}}>Test</h1>
    </div>
  );
};

export default Test;
