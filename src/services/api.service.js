const axios = require('axios');

class ApiService {
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
            (config) => {
                const token = localStorage.getItem('token');
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
            (error) => {
                if (error.response?.status === 401) {
                    // Token geçersiz veya süresi dolmuş
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth işlemleri
    async login(email, password) {
        const response = await this.api.post('/auth/login', { email, password });
        return response.data;
    }

    async register(userData) {
        const response = await this.api.post('/auth/register', userData);
        return response.data;
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
}

module.exports = new ApiService(); 