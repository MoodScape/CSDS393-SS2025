from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.user import User
from models.playlist import Playlist

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = {
            '_id': str(user.id),
            'username': user.username,
            'bio': user.bio or '',
            'profile_picture': user.preferences.get('profile_picture', '') if user.preferences else '',
            'followers_count': len(user.followers),
            'following_count': len(user.following),
            'created_at': user.created_at.isoformat(),
            'updated_at': user.updated_at.isoformat()
        }
        
        # Get all user's playlists
        playlists = Playlist.objects(user=user)
        
        formatted_playlists = []
        for playlist in playlists:
            formatted_playlists.append({
                '_id': str(playlist.id),
                'name': playlist.name,
                'description': playlist.description or '',
                'song_count': len(playlist.songs),
                'is_public': playlist.is_public,
                'created_at': playlist.created_at.isoformat(),
                'updated_at': playlist.updated_at.isoformat()
            })
        
        # Sort by updated_at
        formatted_playlists.sort(key=lambda x: x['updated_at'], reverse=True)
        
        # Get recent mood summary if Song model exists
        mood_summary = {}
        try:
            from models.song_log import SongLog
            recent_songs = SongLog.objects(user=user).order_by('-logged_at').limit(10)
            for song in recent_songs:
                mood = song.mood or 'Unknown'
                mood_summary[mood] = mood_summary.get(mood, 0) + 1
        except:
            # Song model might not exist yet
            pass
        
        return jsonify({
            'user': user_data,
            'playlists': formatted_playlists,
            'total_playlists': len(formatted_playlists),
            'public_playlists_count': sum(1 for p in formatted_playlists if p['is_public']),
            'private_playlists_count': sum(1 for p in formatted_playlists if not p['is_public']),
            'recent_mood_summary': mood_summary
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@profile_bp.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        
        # Update bio
        if 'bio' in data:
            user.bio = data['bio']
        
        # Update profile picture in preferences
        if 'profile_picture' in data:
            if not user.preferences:
                user.preferences = {}
            user.preferences['profile_picture'] = data['profile_picture']
        
        # Update timestamp
        user.updated_at = datetime.utcnow()
        user.save()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'updated_fields': list(data.keys())
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@profile_bp.route('/api/profile/stats', methods=['GET'])
@jwt_required()
def get_profile_stats():
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        stats = {
            'total_songs_logged': 0,
            'mood_distribution': [],
            'top_artists': []
        }
        
        # Try to get stats if SongLog model exists
        try:
            from models.song_log import SongLog
            from mongoengine import Q
            
            # Total songs
            total_songs = SongLog.objects(user=user).count()
            stats['total_songs_logged'] = total_songs
            
            # Mood distribution
            pipeline = [
                {'$match': {'user': user.id}},
                {'$group': {
                    '_id': '$mood',
                    'count': {'$sum': 1}
                }},
                {'$sort': {'count': -1}}
            ]
            mood_data = list(SongLog.objects.aggregate(pipeline))
            stats['mood_distribution'] = [
                {'mood': item['_id'], 'count': item['count']} 
                for item in mood_data if item['_id']
            ]
            
            # Top artists
            pipeline = [
                {'$match': {'user': user.id}},
                {'$group': {
                    '_id': '$artist',
                    'count': {'$sum': 1}
                }},
                {'$sort': {'count': -1}},
                {'$limit': 5}
            ]
            artist_data = list(SongLog.objects.aggregate(pipeline))
            stats['top_artists'] = [
                {'artist': item['_id'], 'count': item['count']} 
                for item in artist_data if item['_id']
            ]
        except:
            # SongLog model might not exist yet
            pass
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500