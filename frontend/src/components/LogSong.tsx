import React, { useState } from 'react';
import { API_BASE_URL } from '../api';
import './LogSong.css';

const MOOD_OPTIONS = [
  'Happy', 'Sad', 'Energetic', 'Calm', 'Angry', 'Relaxed', 'Focused', 'Anxious'
];

interface LogSongProps {
  onSongLogged: () => void;
}

const LogSong: React.FC<LogSongProps> = ({ onSongLogged }) => {
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [mood, setMood] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!songTitle || !artist || !mood) {
      setError('All fields are required.');
      return;
    }
    try {
      setLoading(true);
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated.');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/songlog`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          song_title: songTitle,
          artist,
          mood,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to log song.');
        return;
      }
      setSuccess('Song logged successfully!');
      setSongTitle('');
      setArtist('');
      setMood('');
      onSongLogged();
    } catch (err) {
      setError('Failed to log song.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logsong-container">
      <h2>Log a Song</h2>
      <form className="logsong-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="songTitle">Song Title</label>
          <input
            id="songTitle"
            type="text"
            value={songTitle}
            onChange={e => setSongTitle(e.target.value)}
            placeholder="Enter song title"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            id="artist"
            type="text"
            value={artist}
            onChange={e => setArtist(e.target.value)}
            placeholder="Enter artist name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mood">Mood</label>
          <select
            id="mood"
            value={mood}
            onChange={e => setMood(e.target.value)}
            required
          >
            <option value="">Select mood</option>
            {MOOD_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="logsong-btn" disabled={loading}>
          {loading ? 'Logging...' : 'Log Song'}
        </button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
};

export default LogSong; 