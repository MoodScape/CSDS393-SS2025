import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import './SocialFeed.css';

interface Recommendation {
  song_title: string;
  artist: string;
  friends: string[];
}

const SocialFeed: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    const token = sessionStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="social-feed">Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div className="social-feed">
        <h2>Song Recommendations</h2>
        <p>No recommendations yet. Follow some users to see what they're listening to!</p>
      </div>
    );
  }

  return (
    <div className="social-feed">
      <h2>Song Recommendations</h2>
      <p className="subtitle">Songs your friends are listening to</p>
      
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-card">
            <div className="song-info">
              <h3>{rec.song_title}</h3>
              <p className="artist">by {rec.artist}</p>
              <p className="friends">
                Listened by: {rec.friends.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
