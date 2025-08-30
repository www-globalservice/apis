/**
 * Fly Security v3.2
 *
 * **Novedades v3.2:**
 * - Nuevo módulo de verificación de conexión en tiempo real.
 * - Pantalla de error de conexión con temporizador de 30 segundos.
 * - Redirección automática si no se recupera la conexión.
 * - Mensaje de "Conexión Recuperada" al volver a estar en línea.
 */

(function() {
    // --- CONFIGURACIÓN INICIAL ---
    const config = {
        // URL a la que redirige el logo. ¡Cámbiala por tu página!
        creatorPage: "#",
        // URL del logo para la marca de agua (opcional, ahora usamos SVG)
        logoUrl: "https://i.ibb.co/prdSf9qW/Fly-segurity-27-08-2025.png",
        // Sensibilidad para la detección de acciones repetitivas
        actionThreshold: {
            clicks: { count: 50, time: 3000 }, // 20 clicks en 3s
            keys: { count: 50, time: 3000 }   // 30 pulsaciones en 3s
        },
        // URL de redirección en caso de pérdida de conexión
        errorRedirectUrl: "http://action_exit"
    };

    // --- LÓGICA DE SEGURIDAD (Sin cambios funcionales mayores) ---

    const checkBanStatus = () => {
        const banInfo = JSON.parse(localStorage.getItem('flySecurityBan'));
        if (banInfo && new Date().getTime() < banInfo.expires) {
            const remainingTime = Math.ceil((banInfo.expires - new Date().getTime()) / (1000 * 60 * 60));
            document.body.innerHTML = `
                <div class="fly-ban-screen">
                    <h1>Acceso Bloqueado</h1>
                    <p>Tu acceso a este sitio ha sido suspendido temporalmente por actividad sospechosa.</p>
                    <p>Podrás volver a intentarlo en aproximadamente <strong>${remainingTime} horas</strong>.</p>
                </div>`;
            throw new Error("User is banned.");
        }
    };

    const banUser = (durationHours = 24) => {
        const expires = new Date().getTime() + durationHours * 60 * 60 * 1000;
        localStorage.setItem('flySecurityBan', JSON.stringify({ expires }));
        localStorage.removeItem('flySecurityWarning');
        checkBanStatus();
    };

    const showWarningPanel = () => {
        if (document.getElementById('fly-warning-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'fly-warning-panel';
        panel.className = 'fly-warning-panel animate__animated animate__fadeInRight';
        panel.innerHTML = `
            <div class="fly-warning-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            </div>
            <div class="fly-warning-text">
                <strong>Actividad Sospechosa Detectada</strong>
                <p>La repetición de esta acción resultará en un bloqueo temporal de tu acceso.</p>
            </div>
        `;
        document.body.appendChild(panel);

        setTimeout(() => {
            panel.classList.remove('animate__fadeInRight');
            panel.classList.add('animate__fadeOutRight');
            setTimeout(() => document.body.removeChild(panel), 1000);
        }, 5000);

        if (localStorage.getItem('flySecurityWarning')) {
            banUser();
        } else {
            localStorage.setItem('flySecurityWarning', 'true');
        }
    };

    // --- MÓDULOS DE PROTECCIÓN (Sin cambios funcionales) ---

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
    const detectRepetitiveAction = (type, time) => {
        const now = new Date().getTime();
        lastActions[type].push(now);
        lastActions[type] = lastActions[type].filter(timestamp => now - timestamp < time);
        if (lastActions[type].length > config.actionThreshold[type].count) {
            showWarningPanel();
            lastActions[type] = [];
        }
    };
    document.addEventListener('click', () => detectRepetitiveAction('clicks', config.actionThreshold.clicks.time));
    document.addEventListener('keydown', () => detectRepetitiveAction('keys', config.actionThreshold.keys.time));

    // --- MEJORAS DE UI Y NUEVO PANEL ---

    const injectStylesAndAnimateCSS = () => {
        // Cargar Animate.css desde un CDN
        const animateCSS = document.createElement('link');
        animateCSS.rel = 'stylesheet';
        animateCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        document.head.appendChild(animateCSS);

        // Inyectar nuestros estilos personalizados
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            /* --- Pantalla de Baneo --- */
            .fly-ban-screen {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: #0c0a10; color: #e0e0e0;
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; z-index: 99999; text-align: center;
            }
            .fly-ban-screen h1 { font-size: 2.8rem; color: #ff3b3b; margin-bottom: 15px; }
            .fly-ban-screen p { font-size: 1.2rem; margin: 5px 20px; max-width: 600px; }

            /* --- Panel de Advertencia --- */
            .fly-warning-panel {
                position: fixed; top: 25px; right: 25px;
                display: flex; align-items: center;
                background-color: #fff; color: #333;
                padding: 15px 20px; border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                z-index: 100000; font-family: 'Segoe UI', sans-serif;
                max-width: 400px; border: 1px solid #eee;
            }
            .fly-warning-icon { margin-right: 15px; }
            .fly-warning-icon svg { width: 30px; height: 30px; color: #ffa000; }
            .fly-warning-text strong { font-size: 1rem; }
            .fly-warning-text p { margin: 4px 0 0; font-size: 0.9rem; color: #555; }

            /* --- Marca de Agua --- */
            #fly-security-watermark-container {
                position: fixed; bottom: 15px; left: 15px;
                z-index: 99998; cursor: pointer;
                display: flex; align-items: center;
            }
            #fly-security-watermark-container a img {
                width: 50px; height: 50px;
                transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            #fly-security-watermark-container a:hover img {
                transform: scale(1.1);
            }
            #fly-connection-timer {
                margin-left: 10px;
                font-family: 'Arial', sans-serif;
                font-size: 1.2rem;
                color: #e0e0e0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                display: none; /* Se mostrará con JS */
            }

            /* --- Nuevo Panel de Sitio Protegido --- */
            #fly-protected-modal {
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                z-index: 200000;
                display: flex; justify-content: center; align-items: center;
                background: radial-gradient(circle, rgba(29, 35, 62, 0.7) 0%, rgba(10, 12, 23, 0.8) 100%);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.5s ease, visibility 0.5s ease;
            }
            #fly-protected-modal.visible {
                opacity: 1;
                visibility: visible;
            }
            .fly-modal-content {
                text-align: center; color: #fff;
                font-family: 'Segoe UI', sans-serif;
            }
            .fly-modal-content .shield-icon svg {
                width: 80px; height: 80px;
                filter: drop-shadow(0 0 15px rgba(0, 191, 255, 0.6));
            }
            .fly-modal-content h2 {
                font-size: 2.5rem; margin: 15px 0 10px;
                letter-spacing: 1px;
            }
            .fly-modal-content p {
                font-size: 1.1rem; color: #ccc;
                max-width: 450px;
            }

            /* --- Pantalla de Error de Conexión --- */
            #fly-connection-error-screen {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 200001;
                display: none; /* Se muestra con JS */
                justify-content: center; align-items: center;
                text-align: center;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: #e0e0e0;
                font-family: 'Segoe UI', sans-serif;
            }
            #fly-connection-error-screen .error-content {
                animation: fadeInZoom 0.8s ease-out;
            }
            #fly-connection-error-screen h2 {
                font-size: 2.5rem; color: #ff6347; margin-bottom: 10px;
            }
            #fly-connection-error-screen p {
                font-size: 1.2rem; margin: 10px 20px;
            }
            #fly-connection-error-timer {
                font-size: 1.8rem;
                color: #ffcc00;
                margin-top: 20px;
            }
            @keyframes fadeInZoom {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(styleSheet);
    };

    const createWatermarkAndModal = () => {
        // Contenedor de la marca de agua
        const watermarkContainer = document.createElement('div');
        watermarkContainer.id = 'fly-security-watermark-container';

        const watermark = document.createElement('a');
        watermark.id = 'fly-security-watermark';

        const logo = document.createElement('img');
        logo.src = config.logoUrl;
        watermark.appendChild(logo);
        watermarkContainer.appendChild(watermark);

        // Cronómetro de conexión (oculto por defecto)
        const connectionTimer = document.createElement('span');
        connectionTimer.id = 'fly-connection-timer';
        connectionTimer.textContent = '0s';
        watermarkContainer.appendChild(connectionTimer);

        document.body.appendChild(watermarkContainer);

        // Modal de "Sitio Protegido"
        const modal = document.createElement('div');
        modal.id = 'fly-protected-modal';
        modal.innerHTML = `
            <div class="fly-modal-content animate__animated">
                <div class="shield-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" style="fill:rgba(0, 191, 255, 0.2); stroke: #00bfff;"></path></svg>
                </div>
                <h2>Sitio Protegido</h2>
                <p>Tu navegación es segura. <br>Este sitio utiliza Fly Security para proteger el contenido.</p>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Pantalla de error de conexión
        const errorScreen = document.createElement('div');
        errorScreen.id = 'fly-connection-error-screen';
        errorScreen.innerHTML = `
            <div class="error-content">
                <h2>Error: Conexión Perdida</h2>
                <p>Se ha detectado una pérdida de conexión a la red.</p>
                <p>Tienes <span id="fly-connection-error-timer">30</span> segundos para recuperarla.</p>
            </div>
        `;
        document.body.appendChild(errorScreen);

        // Event Listeners
        watermark.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('visible');
            modal.querySelector('.fly-modal-content').classList.add('animate__zoomIn');
            modal.querySelector('.fly-modal-content').classList.remove('animate__zoomOut');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                 modal.querySelector('.fly-modal-content').classList.remove('animate__zoomIn');
                 modal.querySelector('.fly-modal-content').classList.add('animate__zoomOut');
                 setTimeout(() => {
                    modal.classList.remove('visible');
                 }, 500);
            }
        });

        let pressTimer;
        watermark.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                window.open(config.creatorPage, '_blank');
            }, 1500);
        });
        watermark.addEventListener('mouseup', () => clearTimeout(pressTimer));
        watermark.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    };

    // --- NUEVA LÓGICA DE VERIFICACIÓN DE CONEXIÓN ---

    let connectionTimerId = null;
    let secondsLeft = 0;
    const CONNECTION_CHECK_INTERVAL = 1000;
    const CONNECTION_LOSS_TIMEOUT = 5000; // 5 segundos para mostrar el timer
    const MAX_DISCONNECTION_TIME = 30; // 30 segundos para la redirección

    const showConnectionErrorScreen = (show) => {
        const screen = document.getElementById('fly-connection-error-screen');
        if (screen) {
            screen.style.display = show ? 'flex' : 'none';
        }
    };
    
    const showConnectionRecoveredMessage = () => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'fly-warning-panel animate__animated animate__fadeInRight';
        messageDiv.style.cssText = `
            position: fixed; top: 25px; right: 25px;
            display: flex; align-items: center;
            background-color: #4CAF50; color: white;
            padding: 15px 20px; border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            z-index: 100001; font-family: 'Segoe UI', sans-serif;
            max-width: 400px;
        `;
        messageDiv.innerHTML = `
            <div style="margin-right: 15px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 30px; height: 30px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            </div>
            <div>
                <strong>Conexión Recuperada</strong>
                <p style="margin: 4px 0 0; font-size: 0.9rem; color: #E8F5E9;">¡Bienvenido de nuevo!</p>
            </div>
        `;
        document.body.appendChild(messageDiv);
    
        setTimeout(() => {
            messageDiv.classList.remove('animate__fadeInRight');
            messageDiv.classList.add('animate__fadeOutRight');
            setTimeout(() => document.body.removeChild(messageDiv), 1000);
        }, 3000);
    };

    const handleOffline = () => {
        const timerElement = document.getElementById('fly-connection-timer');
        const errorTimerElement = document.getElementById('fly-connection-error-timer');

        if (!connectionTimerId) {
            secondsLeft = MAX_DISCONNECTION_TIME;
            
            // Muestra el timer al lado del logo
            if (timerElement) {
                timerElement.textContent = `...`;
                setTimeout(() => {
                    timerElement.style.display = 'block';
                }, CONNECTION_LOSS_TIMEOUT);
            }
            
            showConnectionErrorScreen(true);
            
            // Inicia el cronómetro de la pantalla de error
            connectionTimerId = setInterval(() => {
                secondsLeft--;
                if (timerElement) timerElement.textContent = `${secondsLeft}s`;
                if (errorTimerElement) errorTimerElement.textContent = `${secondsLeft}`;
                
                if (secondsLeft <= 0) {
                    clearInterval(connectionTimerId);
                    window.location.href = config.errorRedirectUrl;
                }
            }, 1000);
        }
    };

    const handleOnline = () => {
        if (connectionTimerId) {
            clearInterval(connectionTimerId);
            connectionTimerId = null;
            showConnectionErrorScreen(false);
            showConnectionRecoveredMessage();
            
            const timerElement = document.getElementById('fly-connection-timer');
            if (timerElement) {
                timerElement.style.display = 'none';
            }
        }
    };

    // Usamos el 'online' y 'offline' de la ventana para una mejor gestión
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // --- INICIALIZACIÓN ---
    document.addEventListener('DOMContentLoaded', () => {
        checkBanStatus();
        injectStylesAndAnimateCSS();
        createWatermarkAndModal();
    });

})();
