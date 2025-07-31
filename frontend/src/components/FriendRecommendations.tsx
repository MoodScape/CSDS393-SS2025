import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import './FriendRecommendations.css';

interface RecommendedUser {
  user: {
    id: string;
    username: string;
    bio?: string;
  };
  rationale: string;
  score: number;
}

interface FriendRecommendationsProps {
  onFollowChange?: () => void;
}

const FriendRecommendations: React.FC<FriendRecommendationsProps> = ({ onFollowChange }) => {
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/recommendations/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      
      // 初始化关注状态
      const initialFollowStatus: Record<string, boolean> = {};
      data.recommendations?.forEach((rec: RecommendedUser) => {
        initialFollowStatus[rec.user.id] = false;
      });
      setFollowStatus(initialFollowStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string, username: string) => {
    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      setFollowStatus(prev => ({ ...prev, [userId]: true }));
      onFollowChange?.();
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async (userId: string, username: string) => {
    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/unfollow`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }

      setFollowStatus(prev => ({ ...prev, [userId]: false }));
      onFollowChange?.();
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  const getAvatarInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="friend-recommendations">
        <h2>推荐朋友</h2>
        <div className="loading">正在加载推荐...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friend-recommendations">
        <h2>推荐朋友</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="friend-recommendations">
      <h2>推荐朋友</h2>
      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <p>暂时没有推荐的朋友。</p>
          <p>继续记录音乐，我们会为您推荐志同道合的朋友！</p>
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((recommendation) => (
            <div key={recommendation.user.id} className="recommendation-item">
              <div className="user-avatar">
                {getAvatarInitials(recommendation.user.username)}
              </div>
              <div className="user-info">
                <h3 className="username">{recommendation.user.username}</h3>
                {recommendation.user.bio && (
                  <p className="bio">{recommendation.user.bio}</p>
                )}
                <p className="rationale">{recommendation.rationale}</p>
              </div>
              <div className="follow-action">
                {followStatus[recommendation.user.id] ? (
                  <button
                    className="follow-btn following"
                    onClick={() => handleUnfollow(recommendation.user.id, recommendation.user.username)}
                  >
                    已关注
                  </button>
                ) : (
                  <button
                    className="follow-btn"
                    onClick={() => handleFollow(recommendation.user.id, recommendation.user.username)}
                  >
                    关注
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRecommendations; 