from mongoengine import Document, StringField, DateTimeField, ListField, BooleanField, ReferenceField
from datetime import datetime

class Playlist(Document):
    user = ReferenceField('User', required=True)
    name = StringField(required=True)
    description = StringField()
    songs = ListField(ReferenceField('SongLog'))
    is_public = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'playlists',
        'indexes': [
            'user',
            'is_public',
            '-updated_at'
        ]
    }