let currentSearchPage = 1;
const resultsPerPage = 12;
let allSearchResults = [];
let currentFilters = {};

document.addEventListener('DOMContentLoaded', async () => {
    setupSearchListeners();
    await performSearch();
});

function setupSearchListeners() {
    const btnSearch = document.getElementById('btnSearch');
    const btnReset = document.getElementById('btnReset');
    const btnNext = document.getElementById('btnNext');
    const btnPrevious = document.getElementById('btnPrevious');
    
    if (btnSearch) btnSearch.addEventListener('click', () => { currentSearchPage = 1; performSearch(); });
    if (btnReset) btnReset.addEventListener('click', resetFilters);
    if (btnNext) btnNext.addEventListener('click', () => { currentSearchPage++; displayResults(); });
    if (btnPrevious) btnPrevious.addEventListener('click', () => { if (currentSearchPage > 1) currentSearchPage--; displayResults(); });
    
    const inputs = document.querySelectorAll('.search-filters input, .search-filters select');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { currentSearchPage = 1; performSearch(); } });
    });
}

async function performSearch() {
    try {
        const loading = showLoading('Buscando...');
        
        const searchName = document.getElementById('searchName').value.trim().toLowerCase();
        const searchCity = document.getElementById('searchCity').value.trim().toLowerCase();
        const searchCountry = document.getElementById('searchCountry').value;
        const searchState = document.getElementById('searchState').value;
        
        currentFilters = { searchName, searchCity, searchCountry, searchState };
        
        let query = db.collection('cases');
        
        if (searchState) {
            query = query.where('state', '==', searchState);
        }
        
        if (searchCountry) {
            query = query.where('country', '==', searchCountry);
        }
        
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        allSearchResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (searchName || searchCity) {
            allSearchResults = allSearchResults.filter(item => {
                const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
                const city = (item.city || '').toLowerCase();
                
                const nameMatch = !searchName || fullName.includes(searchName);
                const cityMatch = !searchCity || city.includes(searchCity);
                
                return nameMatch && cityMatch;
            });
        }
        
        hideLoading();
        displayResults();
    } catch (error) {
        console.error('Error en búsqueda:', error);
        hideLoading();
        showAlert('Error al realizar la búsqueda', 'danger');
    }
}

function displayResults() {
    const resultsCount = document.getElementById('resultsCount');
    const searchResults = document.getElementById('searchResults');
    const paginationControls = document.getElementById('paginationControls');
    
    if (resultsCount) {
        resultsCount.textContent = `${allSearchResults.length} resultados encontrados`;
    }
    
    if (allSearchResults.length === 0) {
        searchResults.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">No se encontraron resultados</p>';
        if (paginationControls) paginationControls.style.display = 'none';
        return;
    }
    
    const start = (currentSearchPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const pageResults = allSearchResults.slice(start, end);
    
    searchResults.innerHTML = '';
    pageResults.forEach(caseData => {
        const card = createCaseCard(caseData);
        searchResults.appendChild(card);
    });
    
    const totalPages = Math.ceil(allSearchResults.length / resultsPerPage);
    if (paginationControls) {
        paginationControls.style.display = totalPages > 1 ? 'flex' : 'none';
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) pageInfo.textContent = `Página ${currentSearchPage} de ${totalPages}`;
    }
}

function resetFilters() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchCity').value = '';
    document.getElementById('searchCountry').value = '';
    document.getElementById('searchState').value = '';
    currentSearchPage = 1;
    performSearch();
}