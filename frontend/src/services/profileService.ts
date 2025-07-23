import api from './api';
import { ProfileResponse, ProfileStats } from '../types';

export const profileService = {
  getCurrentUserProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data: { bio?: string; profile_picture?: string }): Promise<any> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  getProfileStats: async (): Promise<ProfileStats> => {
    const response = await api.get('/profile/stats');
    return response.data;
  }
};