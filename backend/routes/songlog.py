from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import SongLog, User
from datetime import datetime
from bson import ObjectId

songlog_bp = Blueprint('songlog', __name__)

MOOD_OPTIONS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Angry', 'Relaxed', 'Focused', 'Anxious']

@songlog_bp.route('', methods=['POST'])
@jwt_required()
def log_song():
    """Log a new song with mood for the current user"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        song_title = data.get('song_title')
        artist = data.get('artist')
        mood = data.get('mood')

        if not song_title or not artist or not mood:
            return jsonify({'error': 'All fields are required'}), 400
        if mood not in MOOD_OPTIONS:
            return jsonify({'error': 'Invalid mood'}), 400

        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        song_log = SongLog(
            user=user,
            song_title=song_title,
            artist=artist,
            mood=mood,
            timestamp=datetime.utcnow()
        )
        song_log.save()
        return jsonify({'message': 'Song logged successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@songlog_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_songlogs():
    """Get current user's song logs, most recent first"""
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        songlogs = SongLog.objects(user=user).order_by('-timestamp')
        return jsonify([
            {
                'id': str(log.id),
                'song_title': log.song_title,
                'artist': log.artist,
                'mood': log.mood,
                'timestamp': log.timestamp.isoformat()
            } for log in songlogs
        ]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@songlog_bp.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    """Get song logs from followed users, most recent first"""
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get list of users the current user is following
        following_ids = [ObjectId(uid) for uid in user.following if ObjectId.is_valid(uid)]
        
        if not following_ids:
            return jsonify([]), 200

        # Get recent song logs from followed users
        feed_logs = SongLog.objects(user__in=following_ids).order_by('-timestamp').limit(50)
        
        return jsonify([
            {
                'id': str(log.id),
                'username': log.user.username,
                'song_title': log.song_title,
                'artist': log.artist,
                'mood': log.mood,
                'timestamp': log.timestamp.isoformat()
            } for log in feed_logs
        ]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500