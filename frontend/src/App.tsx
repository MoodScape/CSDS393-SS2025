import React from 'react';
import './App.css';
import LogSongForm from './components/LogSongForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>MoodScape</h1>
        <p>Track your music and mood</p>
      </header>
      <main className="App-main">
        <LogSongForm />
      </main>
    </div>
  );
}

export default App;
