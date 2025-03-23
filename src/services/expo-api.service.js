import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

class ExpoApiService {
    constructor() {
        this.api = axios.create({
            baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Request interceptor - token ekleme
        this.api.interceptors.request.use(
            async (config) => {
                const token = await SecureStore.getItemAsync('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - hata yönetimi
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    await this.handleUnauthorized();
                }
                return Promise.reject(error);
            }
        );

        // İnternet bağlantısı kontrolü
        this.setupNetworkListener();
    }

    setupNetworkListener() {
        NetInfo.addEventListener(state => {
            if (state.isConnected) {
                this.syncOfflineData();
            }
        });
    }

    async handleUnauthorized() {
        await SecureStore.deleteItemAsync('token');
        // Expo Router ile login sayfasına yönlendirme
        // Bu kısım navigation yapınıza göre değişebilir
    }

    // Auth işlemleri
    async login(email, password) {
        const response = await this.api.post('/auth/login', { email, password });
        await SecureStore.setItemAsync('token', response.data.token);
        return response.data;
    }

    async register(userData) {
        const response = await this.api.post('/auth/register', userData);
        await SecureStore.setItemAsync('token', response.data.token);
        return response.data;
    }

    async logout() {
        await SecureStore.deleteItemAsync('token');
        await AsyncStorage.removeItem('offlineData');
    }

    // Kelime işlemleri
    async addWord(wordData) {
        try {
            const response = await this.api.post('/words', wordData);
            return response.data;
        } catch (error) {
            if (!error.response) {
                // İnternet bağlantısı yoksa offline depolama
                await this.saveOfflineData('/words', wordData);
                return { success: true, message: 'Offline kaydedildi' };
            }
            throw error;
        }
    }

    async getWords(filters = {}) {
        const response = await this.api.get('/words', { params: filters });
        return response.data;
    }

    async getWordById(wordId) {
        const response = await this.api.get(`/words/${wordId}`);
        return response.data;
    }

    async updateWord(wordId, wordData) {
        try {
            const response = await this.api.put(`/words/${wordId}`, wordData);
            return response.data;
        } catch (error) {
            if (!error.response) {
                await this.saveOfflineData(`/words/${wordId}`, wordData);
                return { success: true, message: 'Offline güncellendi' };
            }
            throw error;
        }
    }

    async deleteWord(wordId) {
        try {
            const response = await this.api.delete(`/words/${wordId}`);
            return response.data;
        } catch (error) {
            if (!error.response) {
                await this.saveOfflineData(`/words/${wordId}/delete`, {});
                return { success: true, message: 'Offline silindi' };
            }
            throw error;
        }
    }

    // Kategori işlemleri
    async getCategories() {
        const response = await this.api.get('/categories');
        return response.data;
    }

    async addCategory(categoryData) {
        try {
            const response = await this.api.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            if (!error.response) {
                await this.saveOfflineData('/categories', categoryData);
                return { success: true, message: 'Offline kaydedildi' };
            }
            throw error;
        }
    }

    // Oyun işlemleri
    async startGame(gameTypeId) {
        const response = await this.api.post('/games/start', { gameTypeId });
        return response.data;
    }

    async submitGameAnswer(sessionId, answer) {
        try {
            const response = await this.api.post(`/games/${sessionId}/submit`, { answer });
            return response.data;
        } catch (error) {
            if (!error.response) {
                await this.saveOfflineData(`/games/${sessionId}/submit`, { answer });
                return { success: true, message: 'Offline kaydedildi' };
            }
            throw error;
        }
    }

    async getGameResult(sessionId) {
        const response = await this.api.get(`/games/${sessionId}/result`);
        return response.data;
    }

    async getLeaderboard() {
        const response = await this.api.get('/games/leaderboard');
        return response.data;
    }

    // Kullanıcı işlemleri
    async getUserProfile() {
        const response = await this.api.get('/users/profile');
        return response.data;
    }

    async updateUserProfile(profileData) {
        try {
            const response = await this.api.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            if (!error.response) {
                await this.saveOfflineData('/users/profile', profileData);
                return { success: true, message: 'Offline güncellendi' };
            }
            throw error;
        }
    }

    async getUserProgress() {
        const response = await this.api.get('/users/progress');
        return response.data;
    }

    // AI işlemleri
    async generateText(categoryId, wordCount = 200) {
        const response = await this.api.post('/ai/generate-text', { categoryId, wordCount });
        return response.data;
    }

    async checkGrammar(text) {
        const response = await this.api.post('/ai/check-grammar', { text });
        return response.data;
    }

    // Offline veri senkronizasyonu
    async syncOfflineData() {
        try {
            const offlineData = await AsyncStorage.getItem('offlineData');
            if (offlineData) {
                const data = JSON.parse(offlineData);
                for (const item of data) {
                    try {
                        await this.api.post(item.endpoint, item.data);
                    } catch (error) {
                        console.error(`Sync error for ${item.endpoint}:`, error);
                    }
                }
                await AsyncStorage.removeItem('offlineData');
            }
        } catch (error) {
            console.error('Offline sync error:', error);
        }
    }

    async saveOfflineData(endpoint, data) {
        try {
            const offlineData = await AsyncStorage.getItem('offlineData');
            const newData = offlineData ? JSON.parse(offlineData) : [];
            newData.push({ endpoint, data, timestamp: new Date().toISOString() });
            await AsyncStorage.setItem('offlineData', JSON.stringify(newData));
        } catch (error) {
            console.error('Offline save error:', error);
        }
    }

    // Expo özel metodları
    async checkAppUpdate() {
        try {
            const response = await this.api.get('/app/version');
            return response.data;
        } catch (error) {
            console.error('Version check error:', error);
            return null;
        }
    }

    async sendPushToken(token) {
        try {
            await this.api.post('/users/push-token', { token });
        } catch (error) {
            console.error('Push token error:', error);
        }
    }
}

export default new ExpoApiService(); 