/**
 * Interfaz de Usuario
 * Componentes y utilidades de UI
 */

function showAlert(message, type = 'info', duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `<span>${sanitizeText(message)}</span><button class="alert-close" onclick="this.parentElement.remove()">&times;</button>`;
    const container = document.querySelector('.main-content') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    if (duration) setTimeout(() => alertDiv.remove(), duration);
    return alertDiv;
}

function showModal(content, title = '') {
    const modal = document.getElementById('infoModal');
    const modalBody = document.getElementById('modalBody');
    if (modal && modalBody) {
        let html = '';
        if (title) html += `<h2>${sanitizeText(title)}</h2>`;
        html += content;
        modalBody.innerHTML = html;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeModal() {
    const modal = document.getElementById('infoModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function showLoading(text = 'Cargando...') {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `<div class="loading-content"><div class="spinner"></div><p>${sanitizeText(text)}</p></div>`;
    document.body.appendChild(loading);
    return loading;
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) loading.remove();
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

function createCaseCard(caseData) {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.onclick = () => window.location.href = `/EncontrAR/pages/caso.html?id=${caseData.id}`;
    const statusClass = `status-${caseData.state.replace('_', '')}`;
    const statusLabel = CASE_STATE_LABELS[caseData.state] || caseData.state;
    const dateFormatted = formatDate(caseData.createdAt);
    const ageText = caseData.age ? `${caseData.age} años` : 'Edad desconocida';
    card.innerHTML = `
        <img src="${caseData.photoUrl || '/EncontrAR/assets/placeholder.png'}" alt="${caseData.firstName}" class="case-image" loading="lazy">
        <div class="case-content">
            <span class="case-status ${statusClass}">${statusLabel}</span>
            <h3 class="case-title">${sanitizeText(caseData.firstName)} ${sanitizeText(caseData.lastName)}</h3>
            <div class="case-info">
                <div class="case-info-item"><span>👤</span><span>${ageText}</span></div>
                <div class="case-info-item"><span>📍</span><span>${sanitizeText(caseData.city)}</span></div>
                <div class="case-info-item"><span>📅</span><span>${dateFormatted}</span></div>
                <div class="case-info-item"><span>💬</span><span>${caseData.reportsCount || 0} reportes</span></div>
            </div>
        </div>
    `;
    return card;
}

async function fillCasesGrid(gridElement, cases) {
    gridElement.innerHTML = '';
    if (cases.length === 0) {
        gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">No se encontraron casos</p>';
        return;
    }
    cases.forEach(caseData => gridElement.appendChild(createCaseCard(caseData)));
}

function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input, textarea, select');
    let isValid = true;
    const errors = {};
    inputs.forEach(input => {
        const value = input.value.trim();
        const error = validateInput(input.name, value, input.type, input.dataset.required);
        if (error) {
            isValid = false;
            errors[input.name] = error;
        }
    });
    return { isValid, errors };
}

function validateInput(name, value, type, required) {
    if (required && !value) return 'Este campo es requerido';
    switch (type) {
        case 'email':
            if (value && !isValidEmail(value)) return 'Email inválido';
            break;
        case 'tel':
            if (value && !isValidPhone(value)) return 'Teléfono inválido';
            break;
    }
    if (name === 'password' && value && !isStrongPassword(value)) return 'Contraseña débil';
    return null;
}

function showValidationErrors(formElement, errors) {
    formElement.querySelectorAll('.form-error').forEach(el => el.remove());
    formElement.querySelectorAll('.form-group').forEach(el => el.classList.remove('form-error'));
    Object.entries(errors).forEach(([fieldName, error]) => {
        const input = formElement.querySelector(`[name="${fieldName}"]`);
        if (input) {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('form-error');
                const errorEl = document.createElement('div');
                errorEl.className = 'form-error';
                errorEl.textContent = error;
                formGroup.appendChild(errorEl);
            }
        }
    });
}

function initializeCommonListeners() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });
        navbarMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
            });
        });
    }
    
    const modal = document.getElementById('infoModal');
    const modalClose = document.querySelector('.modal-close');
    if (modal && modalClose) {
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    initializeCommonListeners();
});