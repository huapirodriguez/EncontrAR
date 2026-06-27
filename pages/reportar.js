document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const messageInput = document.getElementById('reportMessage');
    const messageCount = document.getElementById('messageCount');
    const btnGetLocation = document.getElementById('btnGetLocation');
    
    if (messageInput) {
        messageInput.addEventListener('input', () => {
            if (messageCount) {
                messageCount.textContent = `${messageInput.value.length}/1000`;
            }
        });
    }
    
    if (btnGetLocation) {
        btnGetLocation.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const location = await getGPSLocation();
                const locationInput = document.getElementById('reportLocation');
                locationInput.value = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            } catch (error) {
                showAlert('No se pudo obtener la ubicación', 'warning');
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleReport);
    }
});

async function handleReport(e) {
    e.preventDefault();
    
    const form = document.getElementById('reportForm');
    const message = document.getElementById('reportMessage').value.trim();
    
    if (!message) {
        showAlert('El mensaje es requerido', 'warning');
        return;
    }
    
    if (containsSpam(message)) {
        showAlert('El mensaje contiene contenido no permitido', 'danger');
        return;
    }
    
    const loading = showLoading('Enviando reporte...');
    
    try {
        let photoUrl = null;
        const photoInput = document.getElementById('reportPhoto');
        
        if (photoInput.files.length > 0) {
            const photoFile = photoInput.files[0];
            const photoValidation = isValidImage(photoFile);
            
            if (!photoValidation.valid) {
                showAlert(photoValidation.error, 'warning');
                hideLoading();
                return;
            }
            
            const compressedImage = await compressImage(photoFile);
            const timestamp = Date.now();
            const photoRef = storage.ref(`reports/${timestamp}_${photoFile.name}`);
            await photoRef.put(compressedImage);
            photoUrl = await photoRef.getDownloadURL();
        }
        
        const reportData = {
            reporterName: document.getElementById('reporterName').value.trim(),
            message: message,
            location: document.getElementById('reportLocation').value.trim(),
            photoUrl: photoUrl,
            createdAt: new Date(),
            userId: authManager.currentUser?.uid || null,
            email: authManager.currentUser?.email || null
        };
        
        await db.collection('reports').add(reportData);
        
        hideLoading();
        showAlert('¡Reporte enviado! Gracias por tu ayuda.', 'success');
        form.reset();
        
        setTimeout(() => {
            window.location.href = '/EncontrAR/';
        }, 2000);
        
    } catch (error) {
        console.error('Error al enviar reporte:', error);
        hideLoading();
        showAlert('Error al enviar el reporte. Intenta de nuevo.', 'danger');
    }
}