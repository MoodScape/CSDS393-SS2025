from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.song_log import SongLog
from models.user import User

song_log_bp = Blueprint('song_log', __name__)

@song_log_bp.route('/api/songlog', methods=['POST'])
@jwt_required()
def create_song_log():
    try:
        # Get the current user from JWT token
        current_user_id = get_jwt_identity()
        current_user = User.objects.get(id=current_user_id)
        
        # Get data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['song_title', 'artist', 'mood']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create new song log
        song_log = SongLog(
            user=current_user,
            song_title=data['song_title'],
            artist=data['artist'],
            mood=data['mood'].lower()  # Store mood in lowercase
        )
        song_log.save()
        
        return jsonify({
            'message': 'Song logged successfully',
            'song_log': {
                'id': str(song_log.id),
                'song_title': song_log.song_title,
                'artist': song_log.artist,
                'mood': song_log.mood,
                'timestamp': song_log.timestamp.isoformat()
            }
        }), 201
        
    except User.DoesNotExist:
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@song_log_bp.route('/api/songlog', methods=['GET'])
@jwt_required()
def get_user_song_logs():
    try:
        # Get the current user from JWT token
        current_user_id = get_jwt_identity()
        current_user = User.objects.get(id=current_user_id)
        
        # Get query parameters
        limit = int(request.args.get('limit', 10))
        offset = int(request.args.get('offset', 0))
        
        # Get user's song logs
        song_logs = SongLog.objects(user=current_user).order_by('-timestamp').skip(offset).limit(limit)
        
        return jsonify({
            'song_logs': [{
                'id': str(log.id),
                'song_title': log.song_title,
                'artist': log.artist,
                'mood': log.mood,
                'timestamp': log.timestamp.isoformat()
            } for log in song_logs],
            'total': SongLog.objects(user=current_user).count()
        }), 200
        
    except User.DoesNotExist:
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500 