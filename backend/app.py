from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
import bcrypt
from datetime import datetime, timedelta, timezone
from config import config

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

# MongoDB connection
try:
    # Get configuration based on environment
    config_name = os.getenv('FLASK_ENV', 'development')
    config = config[config_name]
    
    mongo_uri = config.MONGODB_URI
    database_name = config.DATABASE_NAME
    
    # Replace placeholder with actual password
    if '<db_password>' in mongo_uri:
        db_password = os.getenv('MONGODB_PASSWORD', 'password')
        mongo_uri = mongo_uri.replace('<db_password>', db_password)
    
    # Create a new client and connect to the server with ServerApi
    client = MongoClient(mongo_uri, server_api=ServerApi('1'))
    
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    db = client[database_name]
    print(f"MongoDB connected successfully to database: {database_name}")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    db = None

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment verification"""
    try:
        # Test MongoDB connection
        if db is not None:
            db.command('ping')
            db_status = "connected"
        else:
            db_status = "disconnected"
        
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

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug) 