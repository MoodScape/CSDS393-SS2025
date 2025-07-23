import { useState } from 'react';
import axios from 'axios';
import './LogSongForm.css';

const LogSongForm = () => {
  // Form data state
  const [formData, setFormData] = useState({
    song_title: '',
    artist: '',
    mood: '',
  });
  
  // Submission status management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: '',
  });
  
  // Mood options (fixed)
  const moods = ['Happy', 'Sad', 'Energetic', 'Calm'];

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ success: false, message: '' });
    
    // Validate form
    if (!formData.song_title || !formData.artist || !formData.mood) {
      setSubmitStatus({
        success: false,
        message: 'All fields are required',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Send to backend API
      const response = await axios.post(
        'http://localhost:3001/api/song/log',
        formData
      );

      // Success handling
      setSubmitStatus({
        success: true,
        message: 'Success! Your song and mood have been recorded',
      });
      
      // Reset form
      setFormData({
        song_title: '',
        artist: '',
        mood: '',
      });
    } catch (error) {
      // Error handling
      setSubmitStatus({
        success: false,
        message: `Error: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='log-song-form-container'>
      <h2>Log Song and Mood</h2>
      <form onSubmit={handleSubmit} className='log-song-form'>
        <div className='form-group'>
          <label htmlFor='song_title'>Song Title *</label>
          <input
            type='text'
            id='song_title'
            name='song_title'
            value={formData.song_title}
            onChange={handleChange}
            placeholder='Enter song title'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='artist'>Artist/Singer *</label>
          <input
            type='text'
            id='artist'
            name='artist'
            value={formData.artist}
            onChange={handleChange}
            placeholder='Enter artist or singer name'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='mood'>Current Mood *</label>
          <select
            id='mood'
            name='mood'
            value={formData.mood}
            onChange={handleChange}
            required
          >
            <option value=''>Select mood</option>
            {moods.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </div>

        <button 
          type='submit' 
          className='submit-btn'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Record Song and Mood'}
        </button>

        {submitStatus.message && (
          <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`}>
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default LogSongForm;
