from mongoengine import Document, StringField, DateTimeField, ListField, DictField
from datetime import datetime, timezone

class User(Document):
    username = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    bio = StringField()
    created_at = DateTimeField(default=datetime.now(timezone.utc))
    updated_at = DateTimeField(default=datetime.now(timezone.utc))
    followers = ListField(StringField())
    following = ListField(StringField())
    preferences = DictField()

    meta = {
        'collection': 'users',
        'indexes': [
            {'fields': ['username'], 'unique': True},
            'followers',
            'following'
        ]
    }
    
    @property
    def user_id(self):
        return str(self.id) 