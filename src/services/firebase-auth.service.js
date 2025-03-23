import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import expoApiService from './expo-api.service';

WebBrowser.maybeCompleteAuthSession();

class FirebaseAuthService {
    constructor() {
        this.app = initializeApp({
            apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
        });

        this.auth = getAuth(this.app);
        this.googleProvider = new GoogleAuthProvider();

        // Google Sign-In için yapılandırma
        this.googleConfig = {
            clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
        };
    }

    // Email/Password ile kayıt
    async registerWithEmail(email, password, username) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            await updateProfile(userCredential.user, { displayName: username });
            
            // Backend'e kullanıcı bilgilerini gönder
            await expoApiService.register({
                firebaseUid: userCredential.user.uid,
                email: email,
                username: username
            });

            return userCredential.user;
        } catch (error) {
            throw this.handleFirebaseError(error);
        }
    }

    // Email/Password ile giriş
    async loginWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            
            // Backend'e giriş bilgilerini gönder
            await expoApiService.login(email, password);

            return userCredential.user;
        } catch (error) {
            throw this.handleFirebaseError(error);
        }
    }

    // Google ile giriş
    async loginWithGoogle() {
        try {
            const [request, response, promptAsync] = Google.useAuthRequest(this.googleConfig);

            if (response?.type === 'success') {
                const { id_token } = response.params;
                const credential = GoogleAuthProvider.credential(id_token);
                const userCredential = await signInWithCredential(this.auth, credential);

                // Backend'e Google giriş bilgilerini gönder
                await expoApiService.login(userCredential.user.email, null, {
                    provider: 'google',
                    idToken: id_token
                });

                return userCredential.user;
            }
        } catch (error) {
            throw this.handleFirebaseError(error);
        }
    }

    // Çıkış yapma
    async logout() {
        try {
            await signOut(this.auth);
            await expoApiService.logout();
        } catch (error) {
            throw this.handleFirebaseError(error);
        }
    }

    // Şifre sıfırlama
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
        } catch (error) {
            throw this.handleFirebaseError(error);
        }
    }

    // Kullanıcı durumu değişikliğini dinleme
    onAuthStateChange(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    // Mevcut kullanıcıyı alma
    getCurrentUser() {
        return this.auth.currentUser;
    }

    // Firebase hata yönetimi
    handleFirebaseError(error) {
        let message = 'Bir hata oluştu. Lütfen tekrar deneyin.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Bu email adresi zaten kullanımda.';
                break;
            case 'auth/invalid-email':
                message = 'Geçersiz email adresi.';
                break;
            case 'auth/operation-not-allowed':
                message = 'Bu işlem şu anda kullanılamıyor.';
                break;
            case 'auth/weak-password':
                message = 'Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.';
                break;
            case 'auth/user-disabled':
                message = 'Bu hesap devre dışı bırakılmış.';
                break;
            case 'auth/user-not-found':
                message = 'Kullanıcı bulunamadı.';
                break;
            case 'auth/wrong-password':
                message = 'Hatalı şifre.';
                break;
            case 'auth/network-request-failed':
                message = 'İnternet bağlantınızı kontrol edin.';
                break;
            case 'auth/too-many-requests':
                message = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
                break;
        }

        return new Error(message);
    }
}

export default new FirebaseAuthService(); 