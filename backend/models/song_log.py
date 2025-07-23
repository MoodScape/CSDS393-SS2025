from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime
from .user import User

class SongLog(Document):
    user = ReferenceField(User, required=True, reverse_delete_rule=2)  # CASCADE
    song_title = StringField(required=True)
    artist = StringField(required=True)
    mood = StringField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'song_logs',
        'indexes': [
            {'fields': ['user', 'timestamp']},
            'mood'
        ]
    } 