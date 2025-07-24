import React, { useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import './LogSongForm.css';

// 定义类型
interface FormData {
  song_title: string;
  artist: string;
  mood: string;
}

interface ApiResponse {
  message: string;
  data: {
    song_title: string;
    artist: string;
    mood: string;
    timestamp: string;
  };
}

const LogSongForm: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    song_title: '',
    artist: '',
    mood: ''
  });
  
  // Loading and success states
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hardcoded list of moods as specified
  const MOODS = ["Happy", "Sad", "Energetic", "Calm"] as const;
  
  // Handle input changes
  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear success/error messages when user starts typing again
    if (success) setSuccess(false);
    if (error) setError(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token from local storage (assuming authentication is implemented)
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to log a song');
        setIsLoading(false);
        return;
      }
      
      // Submit data to the API
      const response: AxiosResponse<ApiResponse> = await axios.post(
        '/api/song/log',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Handle success
      if (response.status === 201) {
        setSuccess(true);
        // Reset form data
        setFormData({
          song_title: '',
          artist: '',
          mood: ''
        });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<{ error: string }>;
        setError(error.response?.data?.error || 'Failed to submit the form');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="log-song-form-container">
      <h2>Log a Song & Mood</h2>
      
      {success && (
        <div className="success-message">
          Song logged successfully!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="song_title">Song Title</label>
          <input
            type="text"
            id="song_title"
            name="song_title"
            value={formData.song_title}
            onChange={handleChange}
            required
            placeholder="Enter song title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            required
            placeholder="Enter artist name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mood">Current Mood</label>
          <select
            id="mood"
            name="mood"
            value={formData.mood}
            onChange={handleChange}
            required
          >
            <option value="">Select your mood</option>
            {MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Submitting...' : 'Log Song'}
        </button>
      </form>
    </div>
  );
};

export default LogSongForm; 