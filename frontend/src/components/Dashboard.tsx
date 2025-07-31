import React, { useState, useEffect } from 'react';
import LogSong from './LogSong';
import SocialFeed from './SocialFeed';
import { API_BASE_URL } from '../api';
import './Dashboard.css';

interface User {
  id: string;
  username: string;
  bio?: string;
  follower_count?: number;
  following_count?: number;
}

interface SongLog {
  id: string;
  song_title: string;
  artist: string;
  mood: string;
  timestamp: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const SIDEBAR_OPTIONS = ['Dashboard', 'Log a Song', 'Social Feed'] as const;
type SidebarOption = typeof SIDEBAR_OPTIONS[number];

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SidebarOption>('Dashboard');
  const [songLogs, setSongLogs] = useState<SongLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<User>(user);
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user.bio || '');
  const [bioStatus, setBioStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'Dashboard') {
      fetchSongLogs();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setUserProfile(data);
      setBioInput(data.bio || '');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSongLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('access_token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/songlog/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch song logs');
      const data = await response.json();
      setSongLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load song logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSongLogged = () => {
    setActiveTab('Dashboard');
    fetchSongLogs();
    fetchUserProfile();
  };

  const handleBioEdit = () => {
    setEditingBio(true);
    setBioStatus(null);
  };

  const handleBioSave = async () => {
    setBioStatus(null);
    const token = sessionStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/bio`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio: bioInput }),
      });
      if (!response.ok) {
        setBioStatus('Failed to update bio.');
        return;
      }
      setBioStatus('Bio updated!');
      setEditingBio(false);
      fetchUserProfile();
    } catch {
      setBioStatus('Failed to update bio.');
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MoodScape</h2>
        </div>
        <nav>
          {SIDEBAR_OPTIONS.map(option => (
            <button
              key={option}
              className={`sidebar-btn${activeTab === option ? ' active' : ''}`}
              onClick={() => setActiveTab(option)}
            >
              {option}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </aside>
      <main className="dashboard-main">
        {activeTab === 'Dashboard' && (
          <div className="profile-section">
            <h1>Welcome, {userProfile.username}!</h1>
            <div className="bio-edit-row">
              {editingBio ? (
                <>
                  <textarea
                    className="bio-edit-input"
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    rows={2}
                    maxLength={200}
                  />
                  <button className="bio-btn" onClick={handleBioSave}>Save</button>
                  <button className="bio-btn cancel" onClick={() => { setEditingBio(false); setBioInput(userProfile.bio || ''); }}>Cancel</button>
                </>
              ) : (
                <>
                  <p className="bio">{userProfile.bio || <span className="bio-placeholder">No bio set.</span>}</p>
                  <button className="bio-btn" onClick={handleBioEdit}>Edit Bio</button>
                </>
              )}
            </div>
            {bioStatus && <div className="bio-status">{bioStatus}</div>}
            <div className="stats">
              <span><strong>{userProfile.follower_count ?? 0}</strong> Followers</span>
              <span><strong>{userProfile.following_count ?? 0}</strong> Following</span>
            </div>
            <h2>Recent Songs</h2>
            {loading ? (
              <div className="loading">Loading songs...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : songLogs.length === 0 ? (
              <div className="no-songs">No songs logged yet.</div>
            ) : (
              <div className="songs-list">
                {songLogs.slice(0, 10).map(song => (
                  <div key={song.id} className="song-item">
                    <div className="song-info">
                      <h3 className="song-title">{song.song_title}</h3>
                      <p className="song-artist">{song.artist}</p>
                    </div>
                    <div className="song-meta">
                      <span className="mood">{song.mood}</span>
                      <span className="timestamp">{new Date(song.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'Log a Song' && (
          <LogSong onSongLogged={handleSongLogged} />
        )}
 {activeTab === 'Social Feed' && <SocialFeed />}
      </main>
    </div>
  );
};

export default Dashboard;