#!/usr/bin/env python3
"""
测试朋友推荐API的脚本
"""

import requests
import json
import sys

# API基础URL
BASE_URL = "http://localhost:5001/api"

def test_recommendations():
    """Test friend recommendations functionality"""
    
    # 1. Register test users
    print("1. Registering test users...")
    test_users = [
        {"username": "testuser1", "password": "password123"},
        {"username": "testuser2", "password": "password123"},
        {"username": "testuser3", "password": "password123"},
        {"username": "testuser4", "password": "password123"}
    ]
    
    tokens = []
    user_ids = []
    
    for user_data in test_users:
        response = requests.post(f"{BASE_URL}/signup", json=user_data)
        if response.status_code == 201:
            data = response.json()
            tokens.append(data['access_token'])
            user_ids.append(data['user']['id'])
            print(f"   Registered user: {user_data['username']} - Success")
        else:
            print(f"   Registered user: {user_data['username']} - Failed: {response.text}")
            return
    
    # 2. Add song logs for each user
    print("\n2. Adding song logs...")
    songs_data = [
        {"song_title": "Chill Song 1", "artist": "Chill Artist", "mood": "chill"},
        {"song_title": "Energetic Song 1", "artist": "Energetic Artist", "mood": "energetic"},
        {"song_title": "Sad Song 1", "artist": "Sad Artist", "mood": "sad"},
        {"song_title": "Happy Song 1", "artist": "Happy Artist", "mood": "happy"}
    ]
    
    for i, token in enumerate(tokens):
        for song in songs_data:
            response = requests.post(
                f"{BASE_URL}/songlog/me",
                json=song,
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 201:
                print(f"   User {i+1} added song: {song['song_title']} - Success")
            else:
                print(f"   User {i+1} added song: {song['song_title']} - Failed: {response.text}")
    
    # 3. Test friend recommendations API
    print("\n3. Testing friend recommendations API...")
    response = requests.get(
        f"{BASE_URL}/users/recommendations/friends",
        headers={"Authorization": f"Bearer {tokens[0]}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   Recommendations API call successful")
        print(f"   Number of recommendations: {data.get('total', 0)}")
        print(f"   Recommendations list:")
        for i, rec in enumerate(data.get('recommendations', [])):
            print(f"     {i+1}. {rec['user']['username']} - {rec['rationale']}")
    else:
        print(f"   Recommendations API call failed: {response.status_code} - {response.text}")
    
    # 4. Test follow functionality
    print("\n4. Testing follow functionality...")
    if len(tokens) >= 2:
        # User 1 follows user 2
        response = requests.patch(
            f"{BASE_URL}/users/{user_ids[1]}/follow",
            headers={"Authorization": f"Bearer {tokens[0]}"}
        )
        if response.status_code == 200:
            print(f"   User 1 followed user 2 - Success")
        else:
            print(f"   User 1 followed user 2 - Failed: {response.text}")
    
    # 5. Test recommendations API again (should exclude already followed users)
    print("\n5. Testing recommendations API again (excluding followed users)...")
    response = requests.get(
        f"{BASE_URL}/users/recommendations/friends",
        headers={"Authorization": f"Bearer {tokens[0]}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   Recommendations API call successful")
        print(f"   Number of recommendations: {data.get('total', 0)}")
        print(f"   Recommendations list:")
        for i, rec in enumerate(data.get('recommendations', [])):
            print(f"     {i+1}. {rec['user']['username']} - {rec['rationale']}")
    else:
        print(f"   Recommendations API call failed: {response.status_code} - {response.text}")
    
    print("\nTest completed!")

if __name__ == "__main__":
    try:
        test_recommendations()
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to backend server. Please ensure the backend server is running at http://localhost:5001")
        sys.exit(1)
    except Exception as e:
        print(f"Error occurred during testing: {e}")
        sys.exit(1) 