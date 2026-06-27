let currentPage = 1;
const casesPerPage = LIMITS.CASES_PER_PAGE;
let allCases = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadRecentCases();
    await updateStatistics();
    setupEventListeners();
});

async function loadRecentCases() {
    const grid = document.getElementById('recentCases');
    if (!grid) return;
    grid.innerHTML = '';
    try {
        const loading = showLoading('Cargando casos...');
        const snapshot = await db.collection('cases')
            .where('state', '!=', 'caso_cerrado')
            .orderBy('state')
            .orderBy('createdAt', 'desc')
            .limit(LIMITS.RECENT_CASES_COUNT)
            .get();
        allCases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        hideLoading();
        if (allCases.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">No hay casos registrados aún</p>';
            return;
        }
        await fillCasesGrid(grid, allCases);
    } catch (error) {
        console.error('Error al cargar casos:', error);
        hideLoading();
        showAlert('Error al cargar los casos', 'danger');
    }
}

async function updateStatistics() {
    try {
        const casesSnapshot = await db.collection('cases').get();
        const reportsSnapshot = await db.collection('reports').get();
        const usersSnapshot = await db.collection('users').get();
        const totalCases = casesSnapshot.size;
        const locatedCases = casesSnapshot.docs.filter(doc => doc.data().state === 'localizado').length;
        const totalReports = reportsSnapshot.size;
        const totalUsers = usersSnapshot.size;
        
        const statTotal = document.getElementById('statTotal');
        const statLocated = document.getElementById('statLocated');
        const statReports = document.getElementById('statReports');
        const statHelpers = document.getElementById('statHelpers');
        
        if (statTotal) statTotal.textContent = totalCases.toLocaleString('es-ES');
        if (statLocated) statLocated.textContent = locatedCases.toLocaleString('es-ES');
        if (statReports) statReports.textContent = totalReports.toLocaleString('es-ES');
        if (statHelpers) statHelpers.textContent = totalUsers.toLocaleString('es-ES');
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

function setupEventListeners() {
    const quickSearch = document.getElementById('quickSearch');
    const searchBtn = document.querySelector('.search-btn');
    if (quickSearch && searchBtn) {
        searchBtn.addEventListener('click', performQuickSearch);
        quickSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') performQuickSearch(); });
    }
}

async function performQuickSearch() {
    const query = document.getElementById('quickSearch').value.trim();
    if (!query) {
        showAlert('Ingresa un término de búsqueda', 'warning');
        return;
    }
    localStorage.setItem('lastSearch', query);
    window.location.href = `/EncontrAR/pages/buscar.html?q=${encodeURIComponent(query)}`;
}