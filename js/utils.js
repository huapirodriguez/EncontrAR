/**
 * Funciones Utilitarias
 * Funciones compartidas para toda la aplicación
 */

/**
 * Obtener la hora actual formateada
 */
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleString('es-ES');
}

/**
 * Formatear fecha
 */
function formatDate(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Formatear hora
 */
function formatTime(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Calcular tiempo relativo ("Hace 2 horas")
 */
function timeAgo(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        año: 31536000,
        mes: 2592000,
        semana: 604800,
        día: 86400,
        hora: 3600,
        minuto: 60
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return `Hace ${interval} ${interval === 1 ? name : name + 's'}`;
        }
    }
    return 'Justo ahora';
}

/**
 * Validar email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validar teléfono
 */
function isValidPhone(phone) {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Validar URL
 */
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Sanitizar texto (prevenir XSS)
 */
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Validar imagen
 */
function isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Formato de imagen no válido' };
    }
    
    if (file.size > LIMITS.MAX_IMAGE_SIZE) {
        return { valid: false, error: `Imagen demasiado grande. Máximo ${LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB` };
    }
    
    return { valid: true };
}

/**
 * Comprimir imagen
 */
async function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > LIMITS.MAX_IMAGE_DIMENSION) {
                    height = Math.round(height * LIMITS.MAX_IMAGE_DIMENSION / width);
                    width = LIMITS.MAX_IMAGE_DIMENSION;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => resolve(blob),
                    'image/jpeg',
                    0.8
                );
            };
            
            img.onerror = () => reject(new Error('Error al cargar imagen'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Generar ID único
 */
function generateUID() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copiar texto al portapapeles
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Error al copiar:', err);
        return false;
    }
}

/**
 * Compartir en redes sociales
 */
function shareOnSocial(platform, url, title) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };
    
    if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=400');
    }
}

/**
 * Generar código QR (usando API externa)
 */
function generateQRCode(text, size = 200) {
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
}

/**
 * Obtener ubicación GPS
 */
function getGPSLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no disponible'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => reject(error)
        );
    });
}

/**
 * Detectar spam
 */
function containsSpam(text) {
    const lowerText = text.toLowerCase();
    return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Validar contraseña
 */
function isStrongPassword(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
}

/**
 * Formatear número de teléfono
 */
function formatPhoneNumber(phone, country = 'AR') {
    phone = phone.replace(/\D/g, '');
    
    const formatters = {
        AR: (n) => n.replace(/^(\d{2})(\d{4})(\d{4})$/, '+$1 $2 $3'),
        US: (n) => n.replace(/^(\d{3})(\d{3})(\d{4})$/, '+1 ($1) $2-$3'),
        BR: (n) => n.replace(/^(\d{2})(\d{5})(\d{4})$/, '+$1 $2-$3'),
    };
    
    return formatters[country] ? formatters[country](phone) : phone;
}

/**
 * Obtener navegador
 */
function getBrowserInfo() {
    const ua = navigator.userAgent;
    const browsers = {
        Chrome: /Chrome\/([\d.]+)/,
        Firefox: /Firefox\/([\d.]+)/,
        Safari: /Version\/([\d.]+).*Safari/,
        Edge: /Edg\/([\d.]+)/,
        'IE': /MSIE ([\d.]+)/
    };
    
    for (const [name, regex] of Object.entries(browsers)) {
        const match = ua.match(regex);
        if (match) return { name, version: match[1] };
    }
    
    return { name: 'Unknown', version: 'Unknown' };
}

/**
 * Detectar dispositivo
 */
function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android|Tablet/i.test(ua);
    
    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        userAgent: ua
    };
}

/**
 * Mostrar notificación
 */
function showNotification(title, options = {}) {
    if (!('Notification' in window)) {
        console.log('Notificaciones no soportadas');
        return;
    }
    
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

/**
 * Solicitar permiso de notificaciones
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notificaciones no soportadas');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

/**
 * Convertir entre unidades
 */
const convertUnits = {
    toKm: (m) => (m / 1000).toFixed(2),
    toMiles: (m) => (m / 1609.34).toFixed(2),
    toMeters: (km) => km * 1000,
    fahrenheit: (c) => (c * 9/5) + 32,
    celsius: (f) => (f - 32) * 5/9
};

/**
 * Delay/Wait
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry con exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            const delayMs = baseDelay * Math.pow(2, attempt);
            await delay(delayMs);
        }
    }
}

/**
 * Debounce
 */
function debounce(fn, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle
 */
function throttle(fn, limit = 1000) {
    let lastRun = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastRun >= limit) {
            fn(...args);
            lastRun = now;
        }
    };
}