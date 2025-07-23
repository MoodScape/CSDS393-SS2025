import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { CurrentUser, Playlist, ProfileStats } from '../types';
import './CurrentUserProfile.css';

const CurrentUserProfile: React.FC = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [moodSummary, setMoodSummary] = useState<{ [mood: string]: number }>({});

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getCurrentUserProfile();
      setUser(response.user);
      setPlaylists(response.playlists);
      setMoodSummary(response.recent_mood_summary);
      setEditedBio(response.user.bio);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await profileService.getProfileStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleBioSave = async () => {
    if (!user) return;

    try {
      await profileService.updateProfile({ bio: editedBio });
      setUser({ ...user, bio: editedBio });
      setIsEditingBio(false);
    } catch (err) {
      console.error('Failed to update bio:', err);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      Happy: '😊',
      Sad: '😢',
      Energetic: '⚡',
      Calm: '😌',
      Angry: '😠',
      Romantic: '❤️',
      Melancholic: '🌧️',
      Excited: '🎉'
    };
    return moodEmojis[mood] || '🎵';
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error || !user) {
    return <div className="profile-error">{error || 'Failed to load profile'}</div>;
  }

  return (
    <div className="current-user-profile">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <button className="change-avatar-btn">Change Photo</button>
        </div>
        
        <div className="profile-info">
          <h1>{user.username}</h1>
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-count">{playlists.length}</span>
              <span className="stat-label">Playlists</span>
            </div>
            <div className="stat">
              <span className="stat-count">{user.followers_count}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-count">{user.following_count}</span>
              <span className="stat-label">Following</span>
            </div>
            {stats && (
              <div className="stat">
                <span className="stat-count">{stats.total_songs_logged}</span>
                <span className="stat-label">Songs Logged</span>
              </div>
            )}
          </div>
          
          <div className="bio-section">
            {isEditingBio ? (
              <div className="bio-edit">
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                />
                <div className="bio-edit-actions">
                  <button onClick={handleBioSave}>Save</button>
                  <button onClick={() => {
                    setIsEditingBio(false);
                    setEditedBio(user.bio);
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="bio-display">
                <p>{user.bio || 'No bio yet. Click edit to add one!'}</p>
                <button className="edit-bio-btn" onClick={() => setIsEditingBio(true)}>
                  Edit Bio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Mood Summary */}
      {Object.keys(moodSummary).length > 0 && (
        <div className="mood-summary-section">
          <h2>Recent Mood Activity</h2>
          <div className="mood-badges">
            {Object.entries(moodSummary).map(([mood, count]) => (
              <div key={mood} className="mood-badge">
                <span className="mood-emoji">{getMoodEmoji(mood)}</span>
                <span className="mood-name">{mood}</span>
                <span className="mood-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Artists */}
      {stats && stats.top_artists.length > 0 && (
        <div className="top-artists-section">
          <h2>Your Top Artists</h2>
          <div className="artists-list">
            {stats.top_artists.map((artist, index) => (
              <div key={artist.artist} className="artist-item">
                <span className="artist-rank">#{index + 1}</span>
                <span className="artist-name">{artist.artist}</span>
                <span className="artist-count">{artist.count} songs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists */}
      <div className="playlists-section">
        <div className="section-header">
          <h2>My Playlists</h2>
          <div className="playlist-counts">
            <span className="count-badge public">{playlists.filter(p => p.is_public).length} Public</span>
            <span className="count-badge private">{playlists.filter(p => !p.is_public).length} Private</span>
          </div>
        </div>
        
        {playlists.length === 0 ? (
          <p className="no-playlists">No playlists yet. Create your first playlist!</p>
        ) : (
          <div className="playlists-grid">
            {playlists.map(playlist => (
              <div key={playlist._id} className="playlist-card">
                <div className="playlist-card-header">
                  <h3>{playlist.name}</h3>
                  <span className={`privacy-badge ${playlist.is_public ? 'public' : 'private'}`}>
                    {playlist.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                {playlist.description && (
                  <p className="playlist-description">{playlist.description}</p>
                )}
                <div className="playlist-stats">
                  <span>{playlist.song_count} songs</span>
                  <span>Updated {new Date(playlist.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="playlist-actions">
                  <button className="view-btn">View</button>
                  <button className="edit-btn">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentUserProfile;