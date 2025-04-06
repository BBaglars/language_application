const bcrypt = require('bcryptjs');
const logger = require('./logger');

class PasswordService {
    static async hash(password) {
        try {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            logger.error('Password hashing hatası:', error);
            throw error;
        }
    }

    static async compare(password, hash) {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            logger.error('Password comparison hatası:', error);
            throw error;
        }
    }

    static validate(password) {
        const errors = [];
        
        // Minimum uzunluk kontrolü
        if (password.length < 8) {
            errors.push('Şifre en az 8 karakter olmalıdır');
        }
        
        // Büyük harf kontrolü
        if (!/[A-Z]/.test(password)) {
            errors.push('Şifre en az bir büyük harf içermelidir');
        }
        
        // Küçük harf kontrolü
        if (!/[a-z]/.test(password)) {
            errors.push('Şifre en az bir küçük harf içermelidir');
        }
        
        // Rakam kontrolü
        if (!/[0-9]/.test(password)) {
            errors.push('Şifre en az bir rakam içermelidir');
        }
        
        // Özel karakter kontrolü
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Şifre en az bir özel karakter içermelidir');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = PasswordService; 