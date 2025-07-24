from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.song_log import song_log_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app)

# Setup JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(song_log_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5001) 