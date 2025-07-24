from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from mongoengine import connect
from dotenv import load_dotenv
import os
import bcrypt
import logging
from datetime import datetime, timedelta, timezone
from config import config

from models import User, SongLog

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'SOME_SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'SOME_JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)

# MongoDB connection using MongoEngine
try:
    config_name = os.getenv('FLASK_ENV', 'development')
    config_obj = config[config_name]
    mongo_uri = config_obj.MONGODB_URI
    database_name = config_obj.DATABASE_NAME
    connect(db=database_name, host=mongo_uri)
    print(f"MongoEngine connected successfully to database: {database_name}")
except Exception as e:
    print(f"MongoEngine connection failed: {e}")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment verification"""
    try:
        # Test MongoDB connection
        val = User.objects.first()  # Try a simple query
        print(val)
        db_status = "connected"
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'database': db_status,
            'message': 'MoodScape API is running'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'error': str(e),
            'message': 'MoodScape API has issues'
        }), 500

# Echo endpoint for testing
@app.route('/api/echo', methods=['POST'])
def echo():
    """Echo endpoint for testing API connectivity"""
    data = request.get_json()
    return jsonify({
        'message': 'Echo response',
        'received_data': data,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint with JWT token generation"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user by username
        user = User.objects(username=username).first()
        
        # Use a dummy password hash for timing attack prevention
        dummy_hash = bcrypt.hashpw(b"dummy_password", bcrypt.gensalt())
        password_hash = user.password_hash.encode('utf-8') if user else dummy_hash
        
        # Verify password (always perform the check to prevent timing attacks)
        password_valid = bcrypt.checkpw(password.encode('utf-8'), password_hash)
        
        if not user or not password_valid:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create JWT token
        access_token = create_access_token(identity=user.user_id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.user_id,
                'username': user.username,
                'bio': user.bio
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {request.url}")
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {str(error)}", exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug) 