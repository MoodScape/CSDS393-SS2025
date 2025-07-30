import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import './UserSearch.css';

interface SearchUser {
  id: string;
  username: string;
  bio?: string;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

interface UserSearchProps {
  onUserClick?: (username: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const token = sessionStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    setFollowLoading(userId);
    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) return;

      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the results to reflect the new follow status
        setResults(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, is_following: !isFollowing }
            : user
        ));
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUserClick = (username: string) => {
    setShowDropdown(false);
    setQuery('');
    if (onUserClick) {
      onUserClick(username);
    } else {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <div className="user-search-container" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowDropdown(true)}
          className="search-input"
        />
        {loading && <div className="search-loading">Searching...</div>}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="no-results">No users found</div>
          ) : (
            results.map(user => (
              <div key={user.id} className="search-result-item">
                <div 
                  className="user-info"
                  onClick={() => handleUserClick(user.username)}
                >
                  <div className="username">{user.username}</div>
                  {user.bio && <div className="user-bio">{user.bio}</div>}
                  <div className="user-stats">
                    {user.follower_count} followers • {user.following_count} following
                  </div>
                </div>
                <button
                  className={`follow-btn ${user.is_following ? 'following' : 'follow'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(user.id, user.is_following);
                  }}
                  disabled={followLoading === user.id}
                >
                  {followLoading === user.id 
                    ? 'Loading...' 
                    : (user.is_following ? 'Following' : 'Follow')
                  }
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch; 