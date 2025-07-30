import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CurrentUserProfile from './components/CurrentUserProfile';
import SocialFeed from './components/SocialFeed';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/profile" element={<CurrentUserProfile />} />
          <Route path="/feed" element={<SocialFeed />} />
          <Route path="/" element={
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Welcome to MoodScape
              </p>
              <a href="/profile" style={{color: '#61dafb'}}>
                Go to Profile
              </a>
              <a href="/feed" style={{color: '#61dafb', display: 'block', marginTop: '10px'}}>
                View Social Feed
              </a>
            </header>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
