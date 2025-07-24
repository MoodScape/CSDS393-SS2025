import React, { useState } from 'react';
import axios from 'axios';
import './SongLogger.css';

interface SongLogFormData {
  song_title: string;
  artist: string;
  mood: string;
}

interface User {
  id: string;
  username: string;
}

interface SongLoggerProps {
  user: User;
}

const MOOD_OPTIONS = [
  'Happy',
  'Sad',
  'Energetic',
  'Calm',
  'Excited',
  'Relaxed',
  'Anxious',
  'Nostalgic'
];

const SongLogger: React.FC<SongLoggerProps> = ({ user }) => {
  const [formData, setFormData] = useState<SongLogFormData>({
    song_title: '',
    artist: '',
    mood: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.song_title || !formData.artist || !formData.mood) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')
        ? 'http://localhost:5001'
        : 'https://csds393-ss2025-backend.onrender.com';
      
      const token = sessionStorage.getItem('access_token');
      
      await axios.post(
        `${apiUrl}/api/songlog`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Song logged successfully!');
      setFormData({
        song_title: '',
        artist: '',
        mood: ''
      });
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to log song. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="song-logger">
      <h2>Log a Song</h2>
      <p>Record what you're listening to and how it makes you feel</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="song_title">Song Title</label>
          <input
            type="text"
            id="song_title"
            name="song_title"
            value={formData.song_title}
            onChange={handleInputChange}
            placeholder="Enter song title"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleInputChange}
            placeholder="Enter artist name"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="mood">Current Mood</label>
          <select
            id="mood"
            name="mood"
            value={formData.mood}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          >
            <option value="">Select a mood</option>
            {MOOD_OPTIONS.map(mood => (
              <option key={mood} value={mood.toLowerCase()}>
                {mood}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging...' : 'Log Song'}
        </button>
      </form>
    </div>
  );
};

export default SongLogger; 