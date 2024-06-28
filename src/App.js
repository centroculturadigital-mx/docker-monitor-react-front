import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Container from './components/Container';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:id" element={<Container />} />
      </Routes>
    </div>
  );
}

export default App;
