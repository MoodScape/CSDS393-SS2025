from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.song_log import SongLog
from models.user import User

song_log_bp = Blueprint('song_log', __name__, url_prefix='/api/song')

# Valid moods list - hardcoded as required
VALID_MOODS = ["Happy", "Sad", "Energetic", "Calm"]

@song_log_bp.route('/log', methods=['POST'])
@jwt_required()
def log_song():
    """Endpoint to log a song with associated mood"""
    data = request.get_json()
    
    # Validate required fields
    if not all(key in data for key in ['song_title', 'artist', 'mood']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate mood value
    if data['mood'] not in VALID_MOODS:
        return jsonify({'error': f'Invalid mood. Must be one of: {", ".join(VALID_MOODS)}'}), 400
    
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.objects.get(id=current_user_id)
        
        # Create song log
        song_log = SongLog(
            user=user,
            song_title=data['song_title'],
            artist=data['artist'],
            mood=data['mood']
        )
        song_log.save()
        
        return jsonify({
            'message': 'Song logged successfully',
            'data': {
                'song_title': song_log.song_title,
                'artist': song_log.artist,
                'mood': song_log.mood,
                'timestamp': song_log.timestamp
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to log song: {str(e)}'}), 500 