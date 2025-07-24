import React, { useState } from 'react';
import { API_BASE_URL } from '../api';
import './FollowButton.css';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  userId, 
  isFollowing, 
  onFollowChange 
}) => {
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      onFollowChange(!isFollowing);
    } catch (error) {
      console.error('Follow toggle error:', error);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`follow-button ${isFollowing ? 'following' : 'follow'}`}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
    </button>
  );
};

export default FollowButton; 