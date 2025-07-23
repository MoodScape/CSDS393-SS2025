from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from mongoengine import connect
from dotenv import load_dotenv
import os
import bcrypt
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

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

from routes.profile import profile_bp
app.register_blueprint(profile_bp)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug) 