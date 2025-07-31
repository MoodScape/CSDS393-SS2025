# Friend Recommendations Feature

## Feature Overview

The friend recommendations feature helps users discover other users with similar music tastes, thereby enhancing platform social interaction and user retention.

## Feature Characteristics

### Recommendation Logic
1. **Based on Common Music Preferences**: Analyze user's recent song moods to find users with similar preferences
2. **Friends of Friends**: Recommend users followed by people the current user follows
3. **Smart Sorting**: Sort by number of common interests and interaction frequency

### User Interface
- Modern card-based layout
- Display user avatars (based on username initials)
- Recommendation rationale display
- One-click follow/unfollow functionality
- Responsive design supporting mobile devices

## Technical Implementation

### Backend API

#### Endpoint: `GET /api/users/recommendations/friends`

**Function**: Get friend recommendations list

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Format**:
```json
{
  "recommendations": [
    {
      "user": {
        "id": "user_id",
        "username": "username",
        "bio": "user_bio"
      },
      "rationale": "Recommendation reason",
      "score": 5
    }
  ],
  "total": 3
}
```

**Recommendation Algorithm**:
1. Get current user's recent 20 songs mood preferences
2. Exclude already followed users and current user
3. Use MongoDB aggregation pipeline to find users with similar mood preferences
4. Calculate "friends of friends" relationships
5. Merge results and sort by score

### Frontend Components

#### FriendRecommendations Component

**Functions**:
- Fetch and display recommended users list
- Handle follow/unfollow operations
- Real-time update of follow status
- Error handling and loading states

**Props**:
- `onFollowChange`: Callback function when follow status changes

**State Management**:
- `recommendations`: Recommended users list
- `loading`: Loading state
- `error`: Error information
- `followStatus`: Follow status mapping

## Database Design

### Enhanced User Model
- `followers`: Followers list
- `following`: Following list
- `preferences`: User preferences settings

### Song Log Model
- `mood`: Song mood tags
- `timestamp`: Log timestamp
- `user`: User reference

## Installation and Setup

### Backend Setup
1. Ensure MongoDB is running
2. Install dependencies: `pip install -r requirements.txt`
3. Start server: `python app.py`

### Frontend Setup
1. Install dependencies: `npm install`
2. Start development server: `npm start`

### Testing
Run test script to verify functionality:
```bash
cd backend
python test_recommendations.py
```

## Usage Flow

1. After user login, select "Friend Recommendations" from the sidebar
2. System displays recommended users list
3. Users can view recommendation reasons and click "Follow"
4. Button changes to "Following" status after following
5. Already followed users won't appear in recommendations list again

## Performance Optimization

- Use MongoDB aggregation pipeline for efficient queries
- Limit recommendation results (maximum 10)
- Cache user follow status
- Responsive design optimized for mobile experience

## Future Extensions

- Artist preference-based recommendations
- Time-based activity analysis
- Geographic location recommendations
- Machine learning optimized recommendation algorithms
- Personalized recommendation rationale display

## Error Handling

- API connection error handling
- User authentication failure handling
- Database query exception handling
- Frontend network error handling
- User-friendly error messages 