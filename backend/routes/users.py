from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, SongLog
from bson import ObjectId

users_bp = Blueprint('users', __name__)

@users_bp.route('/<user_id>/public-profile', methods=['GET'])
@jwt_required()
def get_public_profile(user_id):
    """Get public profile of a user"""
    try:
        # Get the logged-in user
        current_user_id = get_jwt_identity()
        
        # Find the target user
        target_user = User.objects(id=user_id).first()
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if current user is following the target user
        is_following = str(target_user.id) in User.objects(id=current_user_id).first().following
        
        # Get public song logs (you can add is_public field later)
        public_songs = SongLog.objects(user=target_user).order_by('-timestamp').limit(10)
        
        return jsonify({
            'user': {
                'id': str(target_user.id),
                'username': target_user.username,
                'bio': target_user.bio,
                'created_at': target_user.created_at.isoformat(),
                'follower_count': len(target_user.followers),
                'following_count': len(target_user.following)
            },
            'is_following': is_following,
            'public_songs': [
                {
                    'id': str(song.id),
                    'song_title': song.song_title,
                    'artist': song.artist,
                    'mood': song.mood,
                    'timestamp': song.timestamp.isoformat()
                } for song in public_songs
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>/follow', methods=['PATCH'])
@jwt_required()
def follow_user(user_id):
    """Follow a user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Prevent self-following
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot follow yourself'}), 400
        
        # Get both users
        current_user = User.objects(id=current_user_id).first()
        target_user = User.objects(id=user_id).first()
        
        if not current_user or not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already following
        if user_id in current_user.following:
            return jsonify({'error': 'Already following this user'}), 400
        
        # Update following/followers
        current_user.following.append(user_id)
        target_user.followers.append(current_user_id)
        
        current_user.save()
        target_user.save()
        
        return jsonify({
            'message': f'Successfully followed {target_user.username}',
            'following_count': len(current_user.following),
            'follower_count': len(target_user.followers)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>/unfollow', methods=['PATCH'])
@jwt_required()
def unfollow_user(user_id):
    """Unfollow a user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get both users
        current_user = User.objects(id=current_user_id).first()
        target_user = User.objects(id=user_id).first()
        
        if not current_user or not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if not following
        if user_id not in current_user.following:
            return jsonify({'error': 'Not following this user'}), 400
        
        # Update following/followers
        current_user.following.remove(user_id)
        target_user.followers.remove(current_user_id)
        
        current_user.save()
        target_user.save()
        
        return jsonify({
            'message': f'Successfully unfollowed {target_user.username}',
            'following_count': len(current_user.following),
            'follower_count': len(target_user.followers)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/by-username/<username>', methods=['GET'])
@jwt_required()
def get_user_by_username(username):
    """Get user by username for profile routing"""
    try:
        user = User.objects(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': str(user.id),
            'username': user.username
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 