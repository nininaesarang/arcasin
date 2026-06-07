document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Cards
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const forgotPasswordCard = document.getElementById('forgotPasswordCard');
    const resetPasswordCard = document.getElementById('resetPasswordCard');

    // DOM Elements - Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const resetForm = document.getElementById('resetForm');

    // DOM Elements - Inputs
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const regUsernameInput = document.getElementById('regUsername');
    const regPasswordInput = document.getElementById('regPassword');
    const regRoleSelect = document.getElementById('regRole');
    const forgotUsernameInput = document.getElementById('forgotUsername');
    const forgotEmailInput = document.getElementById('forgotEmail');
    const resetPasswordInput = document.getElementById('resetPassword');
    const resetConfirmPasswordInput = document.getElementById('resetConfirmPassword');
    const resetTargetUserEl = document.getElementById('resetTargetUser');

    // DOM Elements - Navigation
    const toRegisterBtn = document.getElementById('toRegister');
    const toForgotPasswordBtn = document.getElementById('toForgotPassword');
    const toLoginBtns = document.querySelectorAll('.to-login-btn');

    // DOM Elements - Toggles and Buttons
    const themeToggle = document.getElementById('themeToggle');
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const toastIcon = document.getElementById('toastIcon');
    const toastClose = document.getElementById('toastClose');

    // --- 1. View Switcher ---
    function showCard(cardToShow) {
        // Hide all cards
        loginCard.classList.add('hidden');
        registerCard.classList.add('hidden');
        forgotPasswordCard.classList.add('hidden');
        resetPasswordCard.classList.add('hidden');

        // Show selected card
        cardToShow.classList.remove('hidden');
    }

    // Check for query parameters for automatic password reset redirection
    const urlParams = new URLSearchParams(window.location.search);
    const resetUser = urlParams.get('reset_user');
    if (resetUser) {
        if (resetTargetUserEl) resetTargetUserEl.textContent = resetUser;
        // Small delay to make sure UI rendering is complete
        setTimeout(() => {
            showCard(resetPasswordCard);
        }, 100);
        // Clean the URL query parameters so refreshing the page doesn't keep showing the reset card
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    toRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showCard(registerCard);
    });

    toForgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showCard(forgotPasswordCard);
    });

    toLoginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showCard(loginCard);
        });
    });

    // --- 2. Password Visibility Toggles ---
    function setupPasswordToggle(toggleBtn, inputField, iconEl) {
        if (toggleBtn && inputField && iconEl) {
            toggleBtn.addEventListener('click', () => {
                const isPassword = inputField.getAttribute('type') === 'password';
                inputField.setAttribute('type', isPassword ? 'text' : 'password');
                iconEl.className = isPassword ? 'far fa-eye-slash' : 'far fa-eye';
            });
        }
    }

    setupPasswordToggle(document.getElementById('togglePassword'), passwordInput, document.getElementById('eyeIcon'));
    setupPasswordToggle(document.getElementById('toggleRegPassword'), regPasswordInput, document.getElementById('eyeIconReg'));
    setupPasswordToggle(document.getElementById('toggleResetPassword'), resetPasswordInput, document.getElementById('eyeIconReset'));

    // --- 3. Form Validation Helper ---
    function validateField(input, errorElement) {
        const group = input.closest('.input-group');
        if (!input.value.trim()) {
            if (group) group.classList.add('invalid');
            return false;
        } else {
            if (group) group.classList.remove('invalid');
            return true;
        }
    }

    // Live validation helpers
    const setupLiveValidation = (inputEl, errorEl) => {
        if (inputEl) {
            inputEl.addEventListener('input', () => validateField(inputEl, errorEl));
        }
    };

    setupLiveValidation(usernameInput, document.getElementById('usernameError'));
    setupLiveValidation(passwordInput, document.getElementById('passwordError'));
    setupLiveValidation(regUsernameInput, document.getElementById('regUsernameError'));
    setupLiveValidation(regPasswordInput, document.getElementById('regPasswordError'));
    setupLiveValidation(forgotUsernameInput, document.getElementById('forgotUsernameError'));
    setupLiveValidation(forgotEmailInput, document.getElementById('forgotEmailError'));
    setupLiveValidation(resetPasswordInput, document.getElementById('resetPasswordError'));

    // --- 4. Loading States Helper ---
    function setSubmitLoading(form, isLoading) {
        const submitBtn = form.querySelector('.submit-btn');
        if (!submitBtn) return;
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        if (isLoading) {
            submitBtn.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnLoader) btnLoader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.classList.remove('hidden');
            if (btnLoader) btnLoader.classList.add('hidden');
        }
    }

    // --- 5. Theme Toggle Logic ---
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeToggleIcon('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeToggleIcon('light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
        showToast('Tema Actualizado', `Se ha activado el modo ${newTheme === 'dark' ? 'oscuro' : 'claro'}.`, 'success');
    });

    function updateThemeToggleIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // --- 6. Form Submissions ---

    // A. LOGIN FORM
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isUsernameValid = validateField(usernameInput, document.getElementById('usernameError'));
        const isPasswordValid = validateField(passwordInput, document.getElementById('passwordError'));
        
        if (!isUsernameValid || !isPasswordValid) {
            showToast('Error de Validación', 'Por favor, completa los campos requeridos.', 'error');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        setSubmitLoading(loginForm, true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showToast('¡Inicio de sesión exitoso!', `Bienvenido de nuevo, ${data.customer_name || username}.`, 'success');
                
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('username', data.username);
                localStorage.setItem('customerName', data.customer_name || '');
                
                loginForm.reset();
                setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
            } else {
                throw new Error(data.msg || 'Usuario o contraseña incorrectos.');
            }
        } catch (error) {
            showToast('Error de Inicio de Sesión', error.message || 'Error al conectar con el servidor.', 'error');
            setSubmitLoading(loginForm, false);
        }
    });

    // B. REGISTER FORM
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isUsernameValid = validateField(regUsernameInput, document.getElementById('regUsernameError'));
        const isPasswordValid = validateField(regPasswordInput, document.getElementById('regPasswordError'));

        if (!isUsernameValid || !isPasswordValid) {
            showToast('Error de Validación', 'Por favor, llena los campos requeridos.', 'error');
            return;
        }

        const username = regUsernameInput.value.trim();
        const password = regPasswordInput.value;
        const role = regRoleSelect.value;

        if (password.length < 6) {
            showToast('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        setSubmitLoading(registerForm, true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast('¡Registro exitoso!', 'Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...', 'success');
                registerForm.reset();
                setTimeout(() => {
                    showCard(loginCard);
                    setSubmitLoading(registerForm, false);
                }, 1500);
            } else {
                throw new Error(data.msg || 'Error al registrar el usuario.');
            }
        } catch (error) {
            showToast('Error de Registro', error.message || 'Error al conectar con el servidor.', 'error');
            setSubmitLoading(registerForm, false);
        }
    });

    // C. FORGOT PASSWORD FORM
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isUsernameValid = validateField(forgotUsernameInput, document.getElementById('forgotUsernameError'));
        const isEmailValid = validateField(forgotEmailInput, document.getElementById('forgotEmailError'));

        if (!isUsernameValid || !isEmailValid) {
            showToast('Error de Validación', 'Por favor, ingresa los campos requeridos.', 'error');
            return;
        }

        const username = forgotUsernameInput.value.trim();
        const email = forgotEmailInput.value.trim();

        // Simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Correo no válido', 'Por favor ingresa un correo electrónico válido.', 'error');
            return;
        }

        setSubmitLoading(forgotForm, true);
        showToast('Enviando...', 'Procesando tu solicitud de recuperación...', 'success');

        try {
            const response = await fetch('/api/send-recovery-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.simulated) {
                    showToast('Recuperación (Local)', 'Enlace generado e impreso en la consola del servidor de Flask.', 'success');
                    
                    // Show recovery link in browser console for developer convenience
                    console.log("[SMTP FALLBACK] Enlace de recuperación:", data.recovery_url);
                    
                    setTimeout(() => {
                        showCard(loginCard);
                        setSubmitLoading(forgotForm, false);
                        forgotForm.reset();
                    }, 3000);
                } else {
                    showToast('Correo Enviado', data.msg, 'success');
                    setTimeout(() => {
                        showCard(loginCard);
                        setSubmitLoading(forgotForm, false);
                        forgotForm.reset();
                    }, 3000);
                }
            } else {
                throw new Error(data.msg || 'Error al enviar el correo de recuperación.');
            }
        } catch (error) {
            showToast('Error de Recuperación', error.message || 'Error al conectar con el servidor.', 'error');
            setSubmitLoading(forgotForm, false);
        }
    });

    // D. RESET PASSWORD FORM
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isPasswordValid = validateField(resetPasswordInput, document.getElementById('resetPasswordError'));

        if (!isPasswordValid) {
            showToast('Error de Validación', 'Por favor, ingresa una contraseña.', 'error');
            return;
        }

        const username = resetTargetUserEl.textContent;
        const password = resetPasswordInput.value;
        const confirmPassword = resetConfirmPasswordInput.value;

        if (password.length < 6) {
            showToast('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            const group = resetConfirmPasswordInput.closest('.input-group');
            if (group) group.classList.add('invalid');
            showToast('Error de Coincidencia', 'Las contraseñas no coinciden.', 'error');
            return;
        } else {
            const group = resetConfirmPasswordInput.closest('.input-group');
            if (group) group.classList.remove('invalid');
        }

        setSubmitLoading(resetForm, true);

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast('¡Contraseña restablecida!', 'Se ha guardado tu nueva contraseña. Redirigiendo al inicio de sesión...', 'success');
                resetForm.reset();
                setTimeout(() => {
                    showCard(loginCard);
                    setSubmitLoading(resetForm, false);
                }, 1500);
            } else {
                throw new Error(data.msg || 'Error al restablecer contraseña.');
            }
        } catch (error) {
            showToast('Error', error.message || 'Error al conectar con el servidor.', 'error');
            setSubmitLoading(resetForm, false);
        }
    });

    // --- 7. Toast Notification System ---
    let toastTimeout;
    
    function showToast(title, message, type = 'success') {
        clearTimeout(toastTimeout);
        
        toastTitle.textContent = title;
        toastBody.textContent = message;
        
        toastIcon.className = 'toast-icon';
        if (type === 'success') {
            toastIcon.classList.add('success');
            toastIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        } else {
            toastIcon.classList.add('error');
            toastIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        }
        
        toast.classList.remove('hidden');
        
        toastTimeout = setTimeout(() => {
            hideToast();
        }, 4000);
    }

    function hideToast() {
        toast.classList.add('hidden');
    }

    toastClose.addEventListener('click', hideToast);
});
