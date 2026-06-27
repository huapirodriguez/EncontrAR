document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const descriptionInput = document.getElementById('description');
    const descriptionCount = document.getElementById('descriptionCount');
    
    if (descriptionInput) {
        descriptionInput.addEventListener('input', () => {
            if (descriptionCount) {
                descriptionCount.textContent = `${descriptionInput.value.length}/500`;
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleRegistration);
    }
});

async function handleRegistration(e) {
    e.preventDefault();
    
    const form = document.getElementById('registerForm');
    const validation = validateForm(form);
    
    if (!validation.isValid) {
        showValidationErrors(form, validation.errors);
        return;
    }
    
    const loading = showLoading('Registrando caso...');
    
    try {
        const photoInput = document.getElementById('photo');
        const photoFile = photoInput.files[0];
        
        if (!photoFile) {
            showAlert('Por favor selecciona una fotografía', 'warning');
            hideLoading();
            return;
        }
        
        const photoValidation = isValidImage(photoFile);
        if (!photoValidation.valid) {
            showAlert(photoValidation.error, 'warning');
            hideLoading();
            return;
        }
        
        // Comprimir imagen
        const compressedImage = await compressImage(photoFile);
        
        // Subir imagen
        const timestamp = Date.now();
        const photoRef = storage.ref(`cases/${timestamp}_${photoFile.name}`);
        await photoRef.put(compressedImage);
        const photoUrl = await photoRef.getDownloadURL();
        
        // Preparar datos
        const caseData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            age: document.getElementById('age').value || null,
            gender: document.getElementById('gender').value || null,
            city: document.getElementById('city').value.trim(),
            country: document.getElementById('country').value,
            lastLocation: document.getElementById('lastLocation').value.trim(),
            missingDate: new Date(document.getElementById('missingDate').value),
            missingTime: document.getElementById('missingTime').value || null,
            description: document.getElementById('description').value.trim(),
            clothing: document.getElementById('clothing').value.trim(),
            distinguishingMarks: document.getElementById('distinguishingMarks').value.trim(),
            contactName: document.getElementById('contactName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            organization: document.getElementById('organization').value.trim(),
            photoUrl: photoUrl,
            state: 'desaparecido',
            createdAt: new Date(),
            updatedAt: new Date(),
            reportsCount: 0,
            verified: false,
            userId: authManager.currentUser?.uid || null
        };
        
        // Guardar en Firestore
        const docRef = await db.collection('cases').add(caseData);
        
        hideLoading();
        showAlert('Caso registrado exitosamente', 'success');
        
        setTimeout(() => {
            window.location.href = `/EncontrAR/pages/caso.html?id=${docRef.id}`;
        }, 2000);
        
    } catch (error) {
        console.error('Error al registrar:', error);
        hideLoading();
        showAlert('Error al registrar el caso. Intenta de nuevo.', 'danger');
    }
}