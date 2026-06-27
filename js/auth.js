/**
 * Sistema de Autenticación
 * Gestión de usuarios y autenticación
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        if (auth) {
            auth.onAuthStateChanged(user => {
                this.currentUser = user;
                this.checkAdminStatus();
                this.updateUI();
                this.logAuthChange();
            });
        }
    }

    async register(email, password, displayName) {
        try {
            if (!isValidEmail(email)) {
                throw new Error('Email inválido');
            }
            if (!isStrongPassword(password)) {
                throw new Error('Contraseña débil');
            }

            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName });

            await db.collection('users').doc(userCredential.user.uid).set({
                email, displayName, role: 'user',
                createdAt: new Date(), updatedAt: new Date(),
                verified: false, avatar: null, phone: null, location: null
            });

            await userCredential.user.sendEmailVerification();
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await auth.signOut();
            this.currentUser = null;
            this.isAdmin = false;
            this.updateUI();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            if (!isValidEmail(email)) throw new Error('Email inválido');
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async checkAdminStatus() {
        if (!this.currentUser) {
            this.isAdmin = false;
            return;
        }
        try {
            const doc = await db.collection('users').doc(this.currentUser.uid).get();
            this.isAdmin = doc.exists && doc.data().role === 'admin';
        } catch (error) {
            this.isAdmin = false;
        }
    }

    async getUserData() {
        if (!this.currentUser) return null;
        try {
            const doc = await db.collection('users').doc(this.currentUser.uid).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            return null;
        }
    }

    updateUI() {
        const adminLink = document.getElementById('adminLink');
        const profileLink = document.getElementById('profileLink');
        const logoutLink = document.getElementById('logoutLink');
        const loginLink = document.getElementById('loginLink');

        if (this.currentUser) {
            if (adminLink) adminLink.style.display = this.isAdmin ? 'block' : 'none';
            if (profileLink) profileLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
        } else {
            if (adminLink) adminLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'block';
        }
    }

    logAuthChange() {
        console.log(this.currentUser ? 'Usuario autenticado: ' + this.currentUser.email : 'Usuario no autenticado');
    }
}

const authManager = new AuthManager();