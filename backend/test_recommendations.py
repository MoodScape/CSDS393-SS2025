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
    """测试朋友推荐功能"""
    
    # 1. 注册测试用户
    print("1. 注册测试用户...")
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
            print(f"   注册用户: {user_data['username']} - 成功")
        else:
            print(f"   注册用户: {user_data['username']} - 失败: {response.text}")
            return
    
    # 2. 为每个用户添加一些歌曲日志
    print("\n2. 添加歌曲日志...")
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
                print(f"   用户 {i+1} 添加歌曲: {song['song_title']} - 成功")
            else:
                print(f"   用户 {i+1} 添加歌曲: {song['song_title']} - 失败: {response.text}")
    
    # 3. 测试朋友推荐API
    print("\n3. 测试朋友推荐API...")
    response = requests.get(
        f"{BASE_URL}/users/recommendations/friends",
        headers={"Authorization": f"Bearer {tokens[0]}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   推荐API调用成功")
        print(f"   推荐数量: {data.get('total', 0)}")
        print(f"   推荐列表:")
        for i, rec in enumerate(data.get('recommendations', [])):
            print(f"     {i+1}. {rec['user']['username']} - {rec['rationale']}")
    else:
        print(f"   推荐API调用失败: {response.status_code} - {response.text}")
    
    # 4. 测试关注功能
    print("\n4. 测试关注功能...")
    if len(tokens) >= 2:
        # 用户1关注用户2
        response = requests.patch(
            f"{BASE_URL}/users/{user_ids[1]}/follow",
            headers={"Authorization": f"Bearer {tokens[0]}"}
        )
        if response.status_code == 200:
            print(f"   用户1关注用户2 - 成功")
        else:
            print(f"   用户1关注用户2 - 失败: {response.text}")
    
    # 5. 再次测试推荐API（应该排除已关注的用户）
    print("\n5. 再次测试推荐API（排除已关注用户）...")
    response = requests.get(
        f"{BASE_URL}/users/recommendations/friends",
        headers={"Authorization": f"Bearer {tokens[0]}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   推荐API调用成功")
        print(f"   推荐数量: {data.get('total', 0)}")
        print(f"   推荐列表:")
        for i, rec in enumerate(data.get('recommendations', [])):
            print(f"     {i+1}. {rec['user']['username']} - {rec['rationale']}")
    else:
        print(f"   推荐API调用失败: {response.status_code} - {response.text}")
    
    print("\n测试完成!")

if __name__ == "__main__":
    try:
        test_recommendations()
    except requests.exceptions.ConnectionError:
        print("错误: 无法连接到后端服务器。请确保后端服务器正在运行在 http://localhost:5001")
        sys.exit(1)
    except Exception as e:
        print(f"测试过程中发生错误: {e}")
        sys.exit(1) 