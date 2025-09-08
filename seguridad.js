/**
 * Fly Security v3.2
 *
 * Objetivo: Refactorizar y mejorar el script a la v3.2 con un enfoque en una UI/UX
 * profesional, elegante y responsiva, garantizando la no colisión con estilos existentes.
 *
 * Novedades v3.2 (Refactorización):
 * - **Arquitectura CSS Anti-Conflictos:** Todas las clases e IDs usan un prefijo único (`flys_v32_`) para evitar colisiones.
 * - **UI/UX Moderna:** Interfaz rediseñada con un tema oscuro, translúcido, gradientes sutiles y animaciones fluidas.
 * - **Diseño 100% Responsivo:** Adaptación impecable a móviles, tablets y desktops de cualquier tamaño.
 * - **Iconografía SVG Integrada:** Iconos de alta calidad incrustados directamente para un rendimiento óptimo.
 * - **Código Modularizado:** La creación de componentes de la UI se ha separado en funciones limpias y legibles.
 * - **Optimización del DOM:** Se sigue la práctica de crear elementos en memoria antes de inyectarlos en la página.
 */

(function() {
    'use strict';

    // --- CONFIGURACIÓN Y CONSTANTES ---
    const config = {
        creatorPage: "#", // URL a la que redirige el logo (mantener presionado)
        logoUrl: "https://i.ibb.co/prdSf9qW/Fly-segurity-27-08-2025.png",
        errorRedirectUrl: "http://action_exit",
        actionThreshold: {
            clicks: { count: 50, time: 3000 }, // 50 clics en 3s
            keys: { count: 50, time: 3000 }   // 50 pulsaciones en 3s
        }
    };

    // Prefijo único para todos los IDs y Clases para evitar conflictos
    const P = 'flys_v32_';

    // Colección de iconos SVG para uso interno
    const icons = {
        warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
        shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" style="fill:rgba(0, 191, 255, 0.2); stroke: #00bfff;"></path></svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`
    };

    // --- LÓGICA DE SEGURIDAD CENTRAL (Sin cambios funcionales) ---

    const banUser = (durationHours = 24) => {
        const expires = new Date().getTime() + durationHours * 60 * 60 * 1000;
        localStorage.setItem('flySecurityBan', JSON.stringify({ expires }));
        localStorage.removeItem('flySecurityWarning');
        checkBanStatus();
    };

    const checkBanStatus = () => {
        const banInfo = JSON.parse(localStorage.getItem('flySecurityBan'));
        if (banInfo && new Date().getTime() < banInfo.expires) {
            const remainingTime = Math.ceil((banInfo.expires - new Date().getTime()) / (1000 * 60 * 60));
            // Inyectamos la pantalla de baneo directamente, ya que el script se detendrá aquí.
            document.body.innerHTML = `
                <div class="${P}ban-screen">
                    <div>
                        <h1>Acceso Bloqueado</h1>
                        <p>Tu acceso ha sido suspendido temporalmente por actividad sospechosa.</p>
                        <p>Podrás volver a intentarlo en aproximadamente <strong>${remainingTime} horas</strong>.</p>
                    </div>
                </div>`;
            const banStyles = document.createElement('style');
            banStyles.textContent = `
                .${P}ban-screen {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: #0a0c17; color: #e0e0e0;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
                    z-index: 2147483647; text-align: center; padding: 1rem;
                }
                .${P}ban-screen h1 { font-size: clamp(2rem, 8vw, 2.8rem); color: #ff3b3b; margin-bottom: 1rem; }
                .${P}ban-screen p { font-size: clamp(1rem, 4vw, 1.2rem); margin: 0.5rem 0; max-width: 600px; }
            `;
            document.head.appendChild(banStyles);
            throw new Error("User is banned.");
        }
    };

    // --- MÓDULOS DE PROTECCIÓN (Sin cambios funcionales) ---

    const setupProtectionListeners = () => {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('selectstart', e => e.preventDefault());
        document.addEventListener('copy', e => { e.preventDefault(); banUser(); });
        document.addEventListener('cut', e => { e.preventDefault(); banUser(); });

        setInterval(() => {
            const threshold = 160;
            if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
                banUser();
            }
        }, 1000);

        document.addEventListener('keydown', e => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toUpperCase() === 'U')) {
                e.preventDefault();
                banUser();
            }
            if (e.ctrlKey && e.key.toUpperCase() === 'P') e.preventDefault();
        });

        let lastActions = { clicks: [], keys: [] };
        const detectRepetitiveAction = (type, time, count) => {
            const now = new Date().getTime();
            lastActions[type].push(now);
            lastActions[type] = lastActions[type].filter(timestamp => now - timestamp < time);
            if (lastActions[type].length > count) {
                showWarningPanel();
                lastActions[type] = [];
            }
        };
        document.addEventListener('click', () => detectRepetitiveAction('clicks', config.actionThreshold.clicks.time, config.actionThreshold.clicks.count));
        document.addEventListener('keydown', () => detectRepetitiveAction('keys', config.actionThreshold.keys.time, config.actionThreshold.keys.count));
    };


    // --- CONSTRUCCIÓN DE LA INTERFAZ DE USUARIO (Refactorizado y Modularizado) ---

    const createToast = (id, className, icon, title, message) => {
        if (document.getElementById(id)) return;

        const panel = document.createElement('div');
        panel.id = id;
        panel.className = `${P}toast ${className} animate__animated animate__fadeInRight`;
        panel.innerHTML = `
            <div class="${P}toast-icon">${icon}</div>
            <div class="${P}toast-text">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(panel);

        setTimeout(() => {
            panel.classList.remove('animate__fadeInRight');
            panel.classList.add('animate__fadeOutRight');
            setTimeout(() => document.body.removeChild(panel), 1000);
        }, 5000);
    };

    const showWarningPanel = () => {
        createToast(
            `${P}warning-panel`,
            `${P}toast-warning`,
            icons.warning,
            'Actividad Sospechosa Detectada',
            'La repetición de esta acción resultará en un bloqueo temporal.'
        );

        if (localStorage.getItem('flySecurityWarning')) {
            banUser();
        } else {
            localStorage.setItem('flySecurityWarning', 'true');
        }
    };
    
    const showConnectionRecoveredMessage = () => {
         createToast(
            `${P}recovered-panel`,
            `${P}toast-success`,
            icons.success,
            'Conexión Recuperada',
            '¡Bienvenido de nuevo!'
        );
    };

    const createDOMComponents = () => {
        // 1. Modal "Sitio Protegido"
        const modal = document.createElement('div');
        modal.id = `${P}protected-modal`;
        modal.innerHTML = `
            <div class="${P}modal-content">
                <div class="${P}modal-icon">${icons.shield}</div>
                <h2>Sitio Protegido</h2>
                <p>Tu navegación es segura. Este sitio utiliza Fly Security para proteger el contenido.</p>
            </div>
        `;

        // 2. Pantalla de Error de Conexión
        const errorScreen = document.createElement('div');
        errorScreen.id = `${P}connection-error-screen`;
        errorScreen.innerHTML = `
            <div class="${P}error-content">
                <h2>Conexión Perdida</h2>
                <p>Se ha detectado una interrupción en tu conexión a la red.</p>
                <p>Redireccionando en <span id="${P}error-timer">30</span> segundos.</p>
            </div>
        `;

        // 3. Marca de Agua
        const watermarkContainer = document.createElement('div');
        watermarkContainer.id = `${P}watermark-container`;
        watermarkContainer.innerHTML = `
            <a href="#" id="${P}watermark-logo-link">
                <img src="${config.logoUrl}" alt="Fly Security Logo">
            </a>
            <span id="${P}connection-timer"></span>
        `;
        
        // 4. Añadir todo al body
        document.body.append(modal, errorScreen, watermarkContainer);

        // 5. Lógica de eventos para los nuevos componentes
        const watermarkLink = document.getElementById(`${P}watermark-logo-link`);
        const modalElement = document.getElementById(`${P}protected-modal`);
        const modalContent = modalElement.querySelector(`.${P}modal-content`);
        let pressTimer;

        watermarkLink.addEventListener('click', (e) => {
            e.preventDefault();
            modalElement.classList.add(`${P}visible`);
            modalContent.classList.add('animate__animated', 'animate__zoomIn');
            modalContent.classList.remove('animate__zoomOut');
        });

        modalElement.addEventListener('click', () => {
            modalContent.classList.remove('animate__zoomIn');
            modalContent.classList.add('animate__zoomOut');
            setTimeout(() => modalElement.classList.remove(`${P}visible`), 500);
        });

        watermarkLink.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => { window.open(config.creatorPage, '_blank'); }, 1500);
        });
        watermarkLink.addEventListener('mouseup', () => clearTimeout(pressTimer));
        watermarkLink.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    };

    const injectStyles = () => {
        // Cargar Animate.css desde CDN
        const animateCSS = document.createElement('link');
        animateCSS.rel = 'stylesheet';
        animateCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        document.head.appendChild(animateCSS);

        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            :root {
                --${P}accent: #00bfff;
                --${P}warning: #ffa000;
                --${P}success: #4CAF50;
                --${P}error: #ff6347;
                --${P}text: #e0e0e0;
                --${P}bg-dark: rgba(10, 12, 23, 0.85);
                --${P}bg-light-trans: rgba(29, 35, 62, 0.7);
                --${P}font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
            }

            /* --- Toast de Notificación (Advertencia y Conexión Recuperada) --- */
            .${P}toast {
                position: fixed; top: 1.5rem; right: 1.5rem;
                display: flex; align-items: center;
                color: var(--${P}text);
                padding: 1rem 1.25rem; border-radius: 0.75rem;
                box-shadow: 0 8px 30px rgba(0,0,0,0.25);
                z-index: 2147483646; font-family: var(--${P}font-family);
                max-width: 400px;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .${P}toast-warning { background-color: rgba(255, 160, 0, 0.5); }
            .${P}toast-success { background-color: rgba(76, 175, 80, 0.5); }
            .${P}toast-icon { margin-right: 1rem; }
            .${P}toast-icon svg { width: 30px; height: 30px; }
            .${P}toast-text strong { font-size: 1rem; }
            .${P}toast-text p { margin: 0.25rem 0 0; font-size: 0.9rem; color: var(--${P}text); opacity: 0.9; }

            /* --- Marca de Agua y Timer --- */
            #${P}watermark-container {
                position: fixed; bottom: 1rem; left: 1rem;
                z-index: 2147483645;
                display: flex; align-items: center;
                gap: 0.75rem;
            }
            #${P}watermark-logo-link img {
                width: 50px; height: 50px;
                transition: transform 0.3s ease, filter 0.3s ease;
                cursor: pointer;
            }
            #${P}watermark-logo-link:hover img {
                transform: scale(1.1);
                filter: drop-shadow(0 0 5px var(--${P}accent));
            }
            #${P}connection-timer {
                font-family: var(--${P}font-family);
                font-size: 1.2rem; color: var(--${P}error);
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                display: none;
            }

            /* --- Modal "Sitio Protegido" --- */
            #${P}protected-modal {
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                z-index: 2147483647;
                display: flex; justify-content: center; align-items: center;
                background: radial-gradient(circle, var(--${P}bg-light-trans) 0%, var(--${P}bg-dark) 100%);
                backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                opacity: 0; visibility: hidden;
                transition: opacity 0.5s ease, visibility 0.5s ease;
                padding: 1rem;
            }
            #${P}protected-modal.${P}visible { opacity: 1; visibility: visible; }
            .${P}modal-content {
                text-align: center; color: var(--${P}text);
                font-family: var(--${P}font-family);
                max-width: 90vw;
            }
            .${P}modal-icon svg {
                width: clamp(60px, 20vw, 80px); height: clamp(60px, 20vw, 80px);
                filter: drop-shadow(0 0 15px var(--${P}accent));
            }
            .${P}modal-content h2 {
                font-size: clamp(2rem, 8vw, 2.5rem); margin: 1rem 0 0.5rem;
                letter-spacing: 1px;
            }
            .${P}modal-content p {
                font-size: clamp(1rem, 4vw, 1.1rem); color: #ccc;
                max-width: 450px;
            }

            /* --- Pantalla de Error de Conexión --- */
            #${P}connection-error-screen {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 2147483647;
                display: none;
                justify-content: center; align-items: center;
                text-align: center;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                color: var(--${P}text);
                font-family: var(--${P}font-family);
                padding: 1rem;
            }
            .${P}error-content { animation: fadeInZoom 0.8s ease-out; }
            .${P}error-content h2 {
                font-size: clamp(2rem, 8vw, 2.5rem); color: var(--${P}error); margin-bottom: 0.5rem;
            }
            .${P}error-content p { font-size: clamp(1rem, 4vw, 1.2rem); margin: 0.5rem 0; }
            #${P}error-timer {
                font-size: clamp(1.5rem, 6vw, 1.8rem);
                color: var(--${P}warning);
                margin-top: 1rem;
            }
            @keyframes fadeInZoom {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }

            /* --- Diseño Responsivo --- */
            @media (max-width: 768px) {
                .${P}toast {
                    top: 1rem; right: 1rem; left: 1rem;
                    max-width: none;
                }
                 #${P}watermark-container { bottom: 0.75rem; left: 0.75rem; }
            }
            @media (min-width: 1920px) {
                .${P}modal-content { max-width: 700px; }
                .${P}modal-content h2 { font-size: 3rem; }
                .${P}modal-content p { font-size: 1.3rem; }
            }
        `;
        document.head.appendChild(styleSheet);
    };

    // --- LÓGICA DE VERIFICACIÓN DE CONEXIÓN (Sin cambios funcionales) ---

    let connectionCountdownInterval = null;

    const handleOffline = () => {
        if (connectionCountdownInterval) return;

        const timerSpan = document.getElementById(`${P}connection-timer`);
        const errorTimerSpan = document.getElementById(`${P}error-timer`);
        const errorScreen = document.getElementById(`${P}connection-error-screen`);

        let secondsLeft = 30;

        // Mostrar la pantalla de error y el timer del logo
        errorScreen.style.display = 'flex';
        timerSpan.style.display = 'block';
        timerSpan.textContent = `${secondsLeft}s`;
        errorTimerSpan.textContent = secondsLeft;

        connectionCountdownInterval = setInterval(() => {
            secondsLeft--;
            timerSpan.textContent = `${secondsLeft}s`;
            errorTimerSpan.textContent = secondsLeft;

            if (secondsLeft <= 0) {
                clearInterval(connectionCountdownInterval);
                window.location.href = config.errorRedirectUrl;
            }
        }, 1000);
    };

    const handleOnline = () => {
        if (connectionCountdownInterval) {
            clearInterval(connectionCountdownInterval);
            connectionCountdownInterval = null;

            document.getElementById(`${P}connection-error-screen`).style.display = 'none';
            document.getElementById(`${P}connection-timer`).style.display = 'none';
            
            showConnectionRecoveredMessage();
        }
    };

    // --- INICIALIZACIÓN DEL SCRIPT ---
    const init = () => {
        // Ejecutar inmediatamente la comprobación de baneo
        checkBanStatus();

        // Inyectar estilos y crear componentes de la UI
        injectStyles();
        createDOMComponents();

        // Configurar los listeners de protección y conexión
        setupProtectionListeners();
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
    };

    // Esperar a que el DOM esté listo para manipularlo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
