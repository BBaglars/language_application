import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class MobileApiService {
    constructor() {
        this.api = axios.create({
            baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Request interceptor - token ekleme
        this.api.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem('token');
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
                    // Token geçersiz veya süresi dolmuş
                    await AsyncStorage.removeItem('token');
                    // React Native navigation ile login sayfasına yönlendirme
                    // Bu kısım navigation yapısınıza göre değişebilir
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth işlemleri
    async login(email, password) {
        const response = await this.api.post('/auth/login', { email, password });
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
    }

    async register(userData) {
        const response = await this.api.post('/auth/register', userData);
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
    }

    async logout() {
        await AsyncStorage.removeItem('token');
    }

    // Kelime işlemleri
    async addWord(wordData) {
        const response = await this.api.post('/words', wordData);
        return response.data;
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
        const response = await this.api.put(`/words/${wordId}`, wordData);
        return response.data;
    }

    async deleteWord(wordId) {
        const response = await this.api.delete(`/words/${wordId}`);
        return response.data;
    }

    // Kategori işlemleri
    async getCategories() {
        const response = await this.api.get('/categories');
        return response.data;
    }

    async addCategory(categoryData) {
        const response = await this.api.post('/categories', categoryData);
        return response.data;
    }

    // Oyun işlemleri
    async startGame(gameTypeId) {
        const response = await this.api.post('/games/start', { gameTypeId });
        return response.data;
    }

    async submitGameAnswer(sessionId, answer) {
        const response = await this.api.post(`/games/${sessionId}/submit`, { answer });
        return response.data;
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
        const response = await this.api.put('/users/profile', profileData);
        return response.data;
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

    // Offline veri senkronizasyonu için yardımcı metodlar
    async syncOfflineData() {
        try {
            const offlineData = await AsyncStorage.getItem('offlineData');
            if (offlineData) {
                const data = JSON.parse(offlineData);
                // Offline verileri sunucuya gönder
                for (const item of data) {
                    await this.api.post(item.endpoint, item.data);
                }
                // Senkronizasyon başarılı olduktan sonra offline verileri temizle
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
            newData.push({ endpoint, data });
            await AsyncStorage.setItem('offlineData', JSON.stringify(newData));
        } catch (error) {
            console.error('Offline save error:', error);
        }
    }
}

export default new MobileApiService(); 