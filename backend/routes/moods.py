from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import User, SongLog
from datetime import datetime, timezone, timedelta

from collections import Counter

moods_bp = Blueprint('moods', __name__)

@moods_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_mood_summary():
    """ Get user's data """
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Need to refactor for MongoDB aggregation
    range_param = request.args.get('range', 'week') # defaults to 'week'
    range_days = {'week':7, 'month':30, 'year':365}
    if range_param not in range_days:
        return jsonify({'error': 'Invalid range. Must be week, month, or year'}), 400
    start_date = datetime.now(timezone.utc) - timedelta(days=range_days[range_param])

    songLog = SongLog.objects(user=user, timestamp__gte=start_date)
    moods = []
    for log in songLog:
        moods.append(log.mood)
    
    mood_counts = Counter(moods)

    return jsonify({
        'mood_counts': dict(mood_counts),
        'total_entries': len(moods),
        'range': range_param
    }), 200
    
