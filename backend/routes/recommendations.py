from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, SongLog

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.objects(id=current_user_id).first()
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's songs
        user_songs = SongLog.objects(user=current_user)
        user_song_set = set()
        for song in user_songs:
            song_key = f"{song.song_title}|{song.artist}"
            user_song_set.add(song_key)
        
        # Get following users
        following_ids = current_user.following
        if not following_ids:
            return jsonify({'recommendations': []}), 200
        
        # Get recommendations
        recommendations = []
        following_users = User.objects(id__in=following_ids)
        
        for friend in following_users:
            friend_songs = SongLog.objects(user=friend).order_by('-timestamp').limit(10)
            
            for song in friend_songs:
                song_key = f"{song.song_title}|{song.artist}"
                
                # Skip if user already has this song
                if song_key in user_song_set:
                    continue
                
                # Check if this song is already in recommendations
                found = False
                for rec in recommendations:
                    if rec['song_title'] == song.song_title and rec['artist'] == song.artist:
                        rec['friends'].append(friend.username)
                        found = True
                        break
                
                if not found:
                    recommendations.append({
                        'song_title': song.song_title,
                        'artist': song.artist,
                        'friends': [friend.username]
                    })
        
        return jsonify({'recommendations': recommendations[:20]}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get recommendations'}), 500
