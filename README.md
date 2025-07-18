# MoodScape

A web application that serves as a personal mood and music journal, and a social network for music discovery. Users can log the songs they listen to, tag them with specific moods, and organize them into playlists. The app visualizes emotional trends over time and enables social music discovery.

## Features

### Personal Music & Mood Journal
- User registration and authentication
- Manual song logging with mood tagging
- Custom playlist creation and management
- Mood visualization charts and trends
- Personal dashboard with music history

### Community Feed & Social Discovery
- Social feed showing friends' recent song logs
- User following/unfollowing system
- Public user profiles with playlists
- Song recommendations based on friends' activity
- Community music discovery

## 🏗️ Project Structure

```
moodscape/
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls and external services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── styles/        # CSS/SCSS files
│   └── package.json
├── backend/               # Flask Python application
│   ├── app.py            # Main Flask application
│   ├── config.py         # Configuration settings
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── tests/            # Test files
│   └── requirements.txt  # Python dependencies
├── .github/workflows/    # CI/CD workflows
├── CONTRIBUTING_FRONTEND.md
├── CONTRIBUTING_BACKEND.md
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Python 3.11 or higher
- MongoDB (local or MongoDB Atlas)
- Git

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Start development server**
   ```bash
   python app.py
   ```

6. **Test the API**
   ```bash
   curl http://localhost:5000/api/health
   ```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **CSS Modules** - Styling

### Backend
- **Flask** - Web framework
- **PyMongo** - MongoDB driver
- **Flask-JWT-Extended** - JWT authentication
- **bcrypt** - Password hashing
- **Flask-CORS** - Cross-origin resource sharing
- **python-dotenv** - Environment variable management

### Database
- **MongoDB** - NoSQL database
- **MongoDB Atlas** - Cloud database service

### Deployment
- **Render** - Hosting platform
- **GitHub Actions** - CI/CD pipeline

## 📋 User Stories

### Sprint 1 - Personal Music & Mood Journal
1. **User Signup** - Create account with username, email, and password
2. **User Login** - Authenticate and access personal dashboard
3. **Log a Song & Mood** - Manually log songs with mood tags
4. **Create Playlist** - Create empty playlists for organization
5. **Add to Playlist** - Add logged songs to playlists
6. **Mood Visualization** - View mood trends over time

### Sprint 2 - Community Feed & Social Discovery
7. **Social Feed** - View friends' recent song logs
8. **Follow a User** - Follow/unfollow other users
9. **View User Profile** - Explore public playlists
10. **Song Recommendations** - Get recommendations based on friends' activity

## 🔧 Development

### Frontend Development
See [CONTRIBUTING_FRONTEND.md](CONTRIBUTING_FRONTEND.md) for detailed frontend development guidelines.

### Backend Development
See [CONTRIBUTING_BACKEND.md](CONTRIBUTING_BACKEND.md) for detailed backend development guidelines.

## 🚀 Deployment

### Environment Variables

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

#### Backend (.env)
```bash
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
PORT=5000

# MongoDB Atlas Configuration
MONGODB_ATLAS_URI=mongodb+srv://admin:<db_password>@moodscape.wo8hmhy.mongodb.net/?retryWrites=true&w=majority&appName=moodscape
MONGODB_PASSWORD=your-actual-password

# Database Names (automatically selected based on FLASK_ENV):
# - development: moodscape_dev
# - production: moodscape_prod
# - testing: moodscape_test
```

### Render Deployment

1. **Backend Deployment**
   - Connect GitHub repository to Render
   - Set environment variables
   - Configure build command: `pip install -r requirements.txt`
   - Configure start command: `gunicorn app:app`

2. **Frontend Deployment**
   - Connect GitHub repository to Render
   - Set environment variables
   - Configure build command: `npm install && npm run build`
   - Configure static site deployment

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Add IP whitelist for Render
5. Create database user

### Environment Management

The project supports multiple environments with separate databases:

- **Development**: Uses `moodscape_dev` database
- **Production**: Uses `moodscape_prod` database  
- **Testing**: Uses `moodscape_test` database

Switch between environments using the provided script:

```bash
# Switch to development (default)
./switch-env.sh development

# Switch to production
./switch-env.sh production

# Switch to testing
./switch-env.sh testing
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
pip install pytest
pytest
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Song Endpoints
- `GET /api/songs` - Get user's songs
- `POST /api/songs` - Log new song
- `GET /api/songs/<song_id>` - Get specific song
- `PUT /api/songs/<song_id>` - Update song
- `DELETE /api/songs/<song_id>` - Delete song

### Playlist Endpoints
- `GET /api/playlists` - Get user's playlists
- `POST /api/playlists` - Create new playlist
- `GET /api/playlists/<playlist_id>` - Get specific playlist
- `PUT /api/playlists/<playlist_id>` - Update playlist
- `DELETE /api/playlists/<playlist_id>` - Delete playlist

### Social Endpoints
- `GET /api/feed` - Get social feed
- `POST /api/users/<user_id>/follow` - Follow user
- `DELETE /api/users/<user_id>/follow` - Unfollow user
- `GET /api/users/<user_id>/profile` - Get user profile
- `GET /api/recommendations` - Get song recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Frontend: Follow TypeScript and React best practices
- Backend: Follow PEP 8 Python style guide
- Use conventional commits for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Michael Frye**
- **Sahith Jalapally**
- **Oreofe Solarin**
- **Tyler Li**
- **Handong He**

## 🆘 Support

If you encounter any issues:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Review the contribution guides
4. Ask in the team chat

## 🔗 Links

- [Frontend Contribution Guide](CONTRIBUTING_FRONTEND.md)
- [Backend Contribution Guide](CONTRIBUTING_BACKEND.md)
- [Project Documentation](docs/)
- [API Documentation](docs/api.md)

**MoodScape** - Where music meets emotion, and friends discover together. 🎵✨ 