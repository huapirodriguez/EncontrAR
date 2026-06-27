/**
 * Firebase Configuration
 * Configuración de Firebase para la aplicación EncontrAR
 */

// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
// Obtén estos valores en Firebase Console > Project Settings
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Inicializar Firebase
let db, auth, storage;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

// Configuración de regiones y países
const SUPPORTED_COUNTRIES = [
    { code: 'AR', name: 'Argentina', lang: 'es' },
    { code: 'BR', name: 'Brasil', lang: 'pt' },
    { code: 'CL', name: 'Chile', lang: 'es' },
    { code: 'CO', name: 'Colombia', lang: 'es' },
    { code: 'MX', name: 'México', lang: 'es' },
    { code: 'PE', name: 'Perú', lang: 'es' },
    { code: 'ES', name: 'España', lang: 'es' },
    { code: 'US', name: 'Estados Unidos', lang: 'en' },
];

// Estados de casos
const CASE_STATES = {
    MISSING: 'desaparecido',
    SEARCHING: 'en_busqueda',
    SIGHTING: 'posible_avistamiento',
    LOCATED: 'localizado',
    CLOSED: 'caso_cerrado'
};

const CASE_STATE_LABELS = {
    'desaparecido': 'Desaparecido',
    'en_busqueda': 'En búsqueda',
    'posible_avistamiento': 'Posible avistamiento',
    'localizado': 'Localizado',
    'caso_cerrado': 'Caso cerrado'
};

// Límites
const LIMITS = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_IMAGE_DIMENSION: 2000, // pixels
    MIN_IMAGE_DIMENSION: 200, // pixels
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_MESSAGE_LENGTH: 1000,
    CASES_PER_PAGE: 12,
    RECENT_CASES_COUNT: 8
};

// Palabras prohibidas para spam
const SPAM_KEYWORDS = [
    'viagra', 'casino', 'poker', 'loan', 'bitcoin',
    'crypto', 'forex', 'dating', 'xxx', 'adult'
];

// Configuración de notificaciones
const NOTIFICATION_SETTINGS = {
    ENABLE_PUSH: true,
    ENABLE_EMAIL: true,
    ENABLE_SMS: false
};