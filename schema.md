#  MoodScape Database Schema

## **Collection: `users`**

```json
{
  "_id": ObjectId,
  "username": String,            // unique, required
  "password_hash": String,       // hashed using bcrypt or similar
  "bio": String,                 // short user bio
  "created_at": Date,
  "updated_at": Date,
  "followers": [ObjectId],       // array of user IDs i.e ["1", "2", "3"]
  "following": [ObjectId],       // array of user IDs
  "preferences": {
    "mood_tags": [String],       // custom or frequently used moods
    "genres": [String]           // optional: music preference
  }
}
```


**Indexes:**

* `username` (unique)
* `followers`, `following` (for graph traversal)

---

## 🎵 **Collection: `song_logs`**

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,           // reference to users._id
  "song_title": String,
  "artist": String,
  "mood": String,                // e.g., "Happy", "Sad", "Energetic"
  "timestamp": Date,
}
```

**Indexes:**

* `user_id + timestamp` (for mood trend queries)
* `mood` (for analytics and similarity)

