import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CurrentUserProfile from './components/CurrentUserProfile';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/profile" element={<CurrentUserProfile />} />
          <Route path="/" element={
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Welcome to MoodScape
              </p>
              <a href="/profile" style={{color: '#61dafb'}}>
                Go to Profile
              </a>
            </header>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;