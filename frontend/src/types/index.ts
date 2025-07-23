export interface CurrentUser {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profile_picture: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  song_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  user: CurrentUser;
  playlists: Playlist[];
  total_playlists: number;
  public_playlists_count: number;
  private_playlists_count: number;
  recent_mood_summary: { [mood: string]: number };
}

export interface ProfileStats {
  total_songs_logged: number;
  mood_distribution: { mood: string; count: number }[];
  top_artists: { artist: string; count: number }[];
}