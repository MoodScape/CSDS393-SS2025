from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, SongLog
from bson import ObjectId
from datetime import datetime, timedelta

users_bp = Blueprint('users', __name__)

@users_bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    """Search users by username with case-insensitive partial matching"""
    try:
        current_user_id = get_jwt_identity()
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify([]), 200
        
        # Case-insensitive partial match using regex
        users = User.objects(username__icontains=query).limit(10)
        
        current_user = User.objects(id=current_user_id).first()
        current_user_following = current_user.following if current_user else []
        
        results = []
        for user in users:
            # We don't want to show the current user in the search results
            if str(user.id) != current_user_id:
                results.append({
                    'id': str(user.id),
                    'username': user.username,
                    'bio': user.bio,
                    'follower_count': len(user.followers),
                    'following_count': len(user.following),
                    'is_following': str(user.id) in current_user_following
                })
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>/public-profile', methods=['GET'])
@jwt_required()
def get_public_profile(user_id):
    try:
        current_user_id = get_jwt_identity()
        target_user = User.objects(id=user_id).first()
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        is_following = str(target_user.id) in User.objects(id=current_user_id).first().following
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
    try:
        current_user_id = get_jwt_identity()
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot follow yourself'}), 400
        current_user = User.objects(id=current_user_id).first()
        target_user = User.objects(id=user_id).first()
        if not current_user or not target_user:
            return jsonify({'error': 'User not found'}), 404
        # Use string IDs and prevent duplicates
        if user_id in current_user.following:
            return jsonify({'error': 'Already following this user'}), 400
        current_user.following.append(str(user_id))
        target_user.followers.append(str(current_user_id))
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
    try:
        current_user_id = get_jwt_identity()
        current_user = User.objects(id=current_user_id).first()
        target_user = User.objects(id=user_id).first()
        if not current_user or not target_user:
            return jsonify({'error': 'User not found'}), 404
        # Use string IDs and remove if present
        if user_id not in current_user.following:
            return jsonify({'error': 'Not following this user'}), 400
        current_user.following.remove(user_id)
        if current_user_id in target_user.followers:
            target_user.followers.remove(current_user_id)
        else:
            return jsonify({'error': 'Inconsistent follow relationship: current_user_id not in followers list'}), 400
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

@users_bp.route('/me/bio', methods=['PATCH'])
@jwt_required()
def update_bio():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        bio = data.get('bio', '')
        user = User.objects(id=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user.bio = bio
        user.save()
        return jsonify({'message': 'Bio updated successfully', 'bio': user.bio}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/recommendations/friends', methods=['GET'])
@jwt_required()
def get_friend_recommendations():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.objects(id=current_user_id).first()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        # Get current user's music preferences (based on recent song logs)
        recent_songs = SongLog.objects(user=current_user).order_by('-timestamp').limit(20)
        user_moods = [song.mood for song in recent_songs]
        user_artists = [song.artist for song in recent_songs]

        # Exclude already followed users and current user
        excluded_users = current_user.following + [current_user_id]
        
        # Recommendations based on common music preferences
        mood_based_recommendations = []
        if user_moods:
            # Find users with similar mood preferences
            similar_users = SongLog.objects(
                mood__in=user_moods,
                user__nin=[ObjectId(uid) for uid in excluded_users]
            ).aggregate([
                {'$group': {
                    '_id': '$user',
                    'common_moods': {'$addToSet': '$mood'},
                    'song_count': {'$sum': 1}
                }},
                {'$sort': {'song_count': -1}},
                {'$limit': 10}
            ])
            
            for user_data in similar_users:
                user = User.objects(id=user_data['_id']).first()
                if user:
                    common_moods = set(user_data['common_moods']) & set(user_moods)
                    mood_based_recommendations.append({
                        'user': {
                            'id': str(user.id),
                            'username': user.username,
                            'bio': user.bio
                        },
                        'rationale': f"Both like {', '.join(common_moods)} mood music",
                        'score': len(common_moods) * user_data['song_count']
                    })

        # Recommendations based on "friends of friends"
        friends_of_friends = []
        if current_user.following:
            # Get users followed by users that current user follows
            following_users = User.objects(id__in=current_user.following)
            for following_user in following_users:
                for friend_id in following_user.following:
                    if friend_id not in excluded_users and friend_id != current_user_id:
                        friend = User.objects(id=friend_id).first()
                        if friend:
                            friends_of_friends.append({
                                'user': {
                                    'id': str(friend.id),
                                    'username': friend.username,
                                    'bio': friend.bio
                                },
                                'rationale': f"Followed by {following_user.username}",
                                'score': 1
                            })

        # Merge recommendations and remove duplicates
        all_recommendations = {}
        
        # Add mood-based recommendations
        for rec in mood_based_recommendations:
            user_id = rec['user']['id']
            if user_id not in all_recommendations:
                all_recommendations[user_id] = rec
            else:
                # If already exists, merge scores and rationales
                all_recommendations[user_id]['score'] += rec['score']
                all_recommendations[user_id]['rationale'] += f" | {rec['rationale']}"

        # Add friends of friends recommendations
        for rec in friends_of_friends:
            user_id = rec['user']['id']
            if user_id not in all_recommendations:
                all_recommendations[user_id] = rec
            else:
                all_recommendations[user_id]['score'] += rec['score']
                all_recommendations[user_id]['rationale'] += f" | {rec['rationale']}"

        # Sort by score and limit results
        sorted_recommendations = sorted(
            all_recommendations.values(),
            key=lambda x: x['score'],
            reverse=True
        )[:10]

        return jsonify({
            'recommendations': sorted_recommendations,
            'total': len(sorted_recommendations)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500 