import React from 'react';
import './Dashboard.css';
import SongLogger from './SongLogger';

interface User {
  id: string;
  username: string;
  bio?: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>MoodScape Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Your Personalized Music & Mood Dashboard</h2>
          <p>Track your music preferences and mood patterns in one place.</p>
        </div>

        <SongLogger user={user} />
        
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Music Analytics</h3>
            <p>View your listening patterns and favorite genres</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Mood Tracking</h3>
            <p>Monitor your mood trends over time</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Recommendations</h3>
            <p>Get personalized music suggestions based on your mood</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;