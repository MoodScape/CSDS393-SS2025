import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import './Profile.css';

interface User {
  id: string;
  username: string;
  bio: string;
  created_at: string;
  follower_count: number;
  following_count: number;
}

interface SongLog {
  id: string;
  song_title: string;
  artist: string;
  mood: string;
  timestamp: string;
}

interface ProfileData {
  user: User;
  is_following: boolean;
  public_songs: SongLog[];
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile(username);
    }
  }, [username]);

  const fetchProfile = async (username: string) => {
    try {
      setLoading(true);
      setError(null);

      // First get user ID by username
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const userResponse = await fetch(`${API_BASE_URL}/api/users/by-username/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('User not found');
      }

      const userData = await userResponse.json();

      // Then get the full profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/users/${userData.id}/public-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await profileResponse.json();
      setProfileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileData) return;

    try {
      setFollowLoading(true);
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const endpoint = profileData.is_following ? 'unfollow' : 'follow';
      const response = await fetch(`${API_BASE_URL}/api/users/${profileData.user.id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      // Update local state
      setProfileData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          is_following: !prev.is_following,
          user: {
            ...prev.user,
            follower_count: prev.is_following 
              ? prev.user.follower_count - 1 
              : prev.user.follower_count + 1
          }
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">Error: {error}</div>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <div className="error">Profile not found</div>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1 className="username">{profileData.user.username}</h1>
          {profileData.user.bio && (
            <p className="bio">{profileData.user.bio}</p>
          )}
          <div className="stats">
            <span className="stat">
              <strong>{profileData.user.follower_count}</strong> followers
            </span>
            <span className="stat">
              <strong>{profileData.user.following_count}</strong> following
            </span>
          </div>
        </div>
        <button
          className={`follow-button ${profileData.is_following ? 'following' : 'follow'}`}
          onClick={handleFollowToggle}
          disabled={followLoading}
        >
          {followLoading ? 'Loading...' : (profileData.is_following ? 'Following' : 'Follow')}
        </button>
      </div>

      <div className="profile-content">
        <h2>Recent Songs</h2>
        {profileData.public_songs.length === 0 ? (
          <p className="no-songs">No songs logged yet.</p>
        ) : (
          <div className="songs-list">
            {profileData.public_songs.map((song) => (
              <div key={song.id} className="song-item">
                <div className="song-info">
                  <h3 className="song-title">{song.song_title}</h3>
                  <p className="song-artist">{song.artist}</p>
                </div>
                <div className="song-meta">
                  <span className="mood">{song.mood}</span>
                  <span className="timestamp">
                    {new Date(song.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 