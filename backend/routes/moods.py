from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import User, SongLog
from datetime import datetime, timezone, timedelta

from collections import Counter

moods_bp = Blueprint("moods", __name__)


@moods_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_mood_summary():
    """Get user's data"""
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Need to refactor for MongoDB aggregation
    range_param = request.args.get("range", "week")  # defaults to 'week'
    range_days = {"week": 7, "month": 30, "year": 365}
    if range_param not in range_days:
        return jsonify({"error": "Invalid range. Must be week, month, or year"}), 400
    start_date = datetime.now(timezone.utc) - timedelta(days=range_days[range_param])

    pipeline = [
        {"$match": {"user": user.id, "timestamp": {"$gte": start_date}}},
        {"$group": {"_id": "$mood", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]

    result = SongLog.objects.aggregate(pipeline)
    mood_counts = {item['_id']: item['count'] for item in result}
    total_entries = sum(mood_counts.values())

    return jsonify({
        "mood_counts": mood_counts,  
        "total_entries": total_entries,
        "range": range_param
    }), 200
