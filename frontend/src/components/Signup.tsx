import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

interface SignupFormData {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  bio?: string;
}

interface SignupResponse {
  message: string;
  user_id: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')
        ? 'http://localhost:5000'
        : 'https://csds393-ss2025-backend.onrender.com';
      
      const response = await axios.post<SignupResponse>(
        `${apiUrl}/api/signup`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Successful signup, redirect to login page
      alert('Account created successfully!')
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Welcome to MoodScape</h2>
        <p>Register now to setup your personalized dashboard</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="signup-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating your account...' : 'Sign-up'}
          </button>

          <p>Already have an account? <a href='/login'>Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;