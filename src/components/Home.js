import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
 
  return (
    <div style={{backgroundColor: '#0F0D0E'}}>
       <Link to={`/test`}>Home</Link>
       <h1 style={{color: 'lightgreen'}}>Home</h1>
    </div>
  );
};

export default Home;
