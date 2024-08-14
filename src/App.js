import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Container from './components/Container';
import Home from './components/Home';
import Test from './components/Test';
import OtherTime from './components/OtherTime';

function App() {
  return (<div>
    <img src="/dashboard/labweb_logo.png" alt="logo" style={{height: "60px", margin: "20px"}} />
    <div className="App">
      <Routes>

        <Route exact path="/" element={<Home />} />
        <Route exact path="/test" element={<Test />} />
        <Route exact path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:id" element={<Container />} />
        <Route path="/dashboard/other-time/:id" element={<OtherTime />} />
      </Routes>
    </div>
  </div>);
}

export default App;
