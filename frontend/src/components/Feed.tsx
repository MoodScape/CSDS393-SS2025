import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import './Feed.css';

interface FeedItem {
  id: string;
  username: string;
  song_title: string;
  artist: string;
  mood: string;
  timestamp: string;
}

const Feed: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/songlog/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const data = await response.json();
      setFeedItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      'Happy': '😊',
      'Sad': '😢',
      'Energetic': '⚡',
      'Calm': '😌',
      'Angry': '😠',
      'Relaxed': '😎',
      'Focused': '🎯',
      'Anxious': '😰'
    };
    return moodEmojis[mood] || '🎵';
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="feed-header">
          <h2>Social Feed</h2>
        </div>
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-container">
        <div className="feed-header">
          <h2>Social Feed</h2>
        </div>
        <div className="feed-error">
          <p>Error: {error}</p>
          <button onClick={fetchFeed} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h2>Social Feed</h2>
        <button onClick={fetchFeed} className="refresh-btn">
          ↻ Refresh
        </button>
      </div>
      
      {feedItems.length === 0 ? (
        <div className="feed-empty">
          <div className="empty-state">
            <h3>Your feed is empty</h3>
            <p>Follow some users to see their music activity here!</p>
            <p>Use the search feature to find and follow other music lovers.</p>
          </div>
        </div>
      ) : (
        <div className="feed-list">
          {feedItems.map(item => (
            <div key={item.id} className="feed-item">
              <div className="feed-item-header">
                <div className="user-info">
                  <span className="username">@{item.username}</span>
                  <span className="timestamp">{formatTimeAgo(item.timestamp)}</span>
                </div>
                <div className="mood-indicator">
                  <span className="mood-emoji">{getMoodEmoji(item.mood)}</span>
                  <span className="mood-text">{item.mood}</span>
                </div>
              </div>
              <div className="feed-item-content">
                <div className="song-info">
                  <h4 className="song-title">{item.song_title}</h4>
                  <p className="artist-name">by {item.artist}</p>
                </div>
                <div className="music-note">🎵</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
