import { useState } from 'react';
import axios from 'axios';
import './LogSongForm.css';

const LogSongForm = () => {
  // ????
  const [formData, setFormData] = useState({
    song_title: '',
    artist: '',
    mood: '',
  });
  
  // ??????
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: '',
  });
  
  // ????????(???)
  const moods = ['Happy', 'Sad', 'Energetic', 'Calm'];

  // ??????
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ????
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ success: false, message: '' });
    
    // ????
    if (!formData.song_title || !formData.artist || !formData.mood) {
      setSubmitStatus({
        success: false,
        message: '?????????',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // ???????
      const response = await axios.post(
        'http://localhost:3001/api/song/log',
        formData
      );

      // ????
      setSubmitStatus({
        success: true,
        message: '????!??????????',
      });
      
      // ????
      setFormData({
        song_title: '',
        artist: '',
        mood: '',
      });
    } catch (error) {
      // ????
      setSubmitStatus({
        success: false,
        message: ????: ,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='log-song-form-container'>
      <h2>???????</h2>
      <form onSubmit={handleSubmit} className='log-song-form'>
        <div className='form-group'>
          <label htmlFor='song_title'>???? *</label>
          <input
            type='text'
            id='song_title'
            name='song_title'
            value={formData.song_title}
            onChange={handleChange}
            placeholder='??????'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='artist'>??/??? *</label>
          <input
            type='text'
            id='artist'
            name='artist'
            value={formData.artist}
            onChange={handleChange}
            placeholder='??????????'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='mood'>???? *</label>
          <select
            id='mood'
            name='mood'
            value={formData.mood}
            onChange={handleChange}
            required
          >
            <option value=''>????</option>
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
          {isSubmitting ? '???...' : '???????'}
        </button>

        {submitStatus.message && (
          <div className={status-message }>
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default LogSongForm;
