import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key-change-in-production')
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    DATABASE_NAME = 'moodscape'
    
    # MongoDB Atlas Configuration  
    MONGODB_ATLAS_URI = os.getenv('MONGODB_ATLAS_URI', 'mongodb+srv://user:rKM3xnA0H3SOgYss@moodscape.wo8hmhy.mongodb.net/?retryWrites=true&w=majority&appName=moodscape')
    
    # JWT Configuration
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:3000",  # React dev server
        "https://csds393-ss2025.onrender.com"  # Production frontend
    ]

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'
    DATABASE_NAME = 'moodscape_dev'
    MONGODB_URI = Config.MONGODB_ATLAS_URI

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'
    DATABASE_NAME = 'moodscape_prod'
    MONGODB_URI = Config.MONGODB_ATLAS_URI

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_NAME = 'moodscape_test'
    MONGODB_URI = Config.MONGODB_ATLAS_URI

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 