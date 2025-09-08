/**
 * Fly Security v3.2
 *
 * Un script de seguridad robusto y moderno para la protección de sitios web.
 * Esta versión introduce un rediseño completo de la UI/UX, encapsulamiento de CSS para
 * prevenir conflictos, diseño totalmente responsive y optimizaciones de código.
 *
 * @version 3.2
 * @author Tu Nombre/Empresa
 * @license MIT
 */
(function() {
    'use strict';

    // --- CONFIGURACIÓN CENTRALIZADA ---
    const config = {
        // URL a la que redirige una pulsación larga en el logo. ¡Cámbiala por tu página!
        creatorPage: "#",
        // URL del logo para todos los elementos de la UI.
        logoUrl: "https://i.ibb.co/prdSf9qW/Fly-segurity-27-08-2025.png",
        // Sensibilidad para la detección de acciones repetitivas.
        actionThreshold: {
            clicks: { count: 50, time: 3000 }, // 50 clics en 3s
            keys: { count: 50, time: 3000 }   // 50 pulsaciones en 3s
        },
        // URL de redirección en caso de pérdida de conexión prolongada.
        errorRedirectUrl: "about:blank",
        // Duración del baneo en horas.
        banDurationHours: 24
    };

    // --- LÓGICA DE ENCAPSULAMIENTO Y UTILIDADES ---

    /**
     * Genera un prefijo aleatorio para las clases y IDs de CSS.
     * @returns {string} Una cadena aleatoria para usar como prefijo.
     */
    const generateCssPrefix = () => 'fs-' + Math.random().toString(36).substring(2, 9);
    const cssPrefix = generateCssPrefix();

    /**
     * Devuelve el nombre de una clase o ID con el prefijo único.
     * @param {string} name - El nombre base del selector.
     * @returns {string} El nombre completo y único del selector.
     */
    const getSelector = (name) => `${cssPrefix}-${name}`;

    // --- LÓGICA DE SEGURIDAD ---

    /**
     * Verifica si el usuario está baneado y muestra la pantalla de bloqueo si es necesario.
     * Lanza un error para detener la ejecución del script si el usuario está baneado.
     */
    const checkBanStatus = () => {
        try {
            const banInfo = JSON.parse(localStorage.getItem('flySecurityBan'));
            if (banInfo && new Date().getTime() < banInfo.expires) {
                const remainingTime = Math.ceil((banInfo.expires - new Date().getTime()) / (1000 * 60 * 60));
                const banScreen = document.createElement('div');
                banScreen.id = getSelector('ban-screen');
                banScreen.innerHTML = `
                    <div class="${getSelector('modal-content')}">
                        <header class="${getSelector('modal-header')}">
                            <img src="${config.logoUrl}" alt="Logo">
                            <h1>FLY SECURITY V3.2</h1>
                        </header>
                        <h2>Acceso Bloqueado</h2>
                        <p>Tu acceso ha sido suspendido temporalmente por actividad sospechosa.</p>
                        <p>Podrás volver a intentarlo en aproximadamente <strong>${remainingTime} horas</strong>.</p>
                    </div>`;
                document.body.innerHTML = ''; // Limpia el body
                document.body.appendChild(banScreen);
                injectStyles(); // Inyecta los estilos necesarios para la pantalla de baneo.
                throw new Error("User is banned.");
            }
        } catch (e) {
            console.error("Fly Security: Error checking ban status.", e);
            // Si hay un error (p.ej. localStorage bloqueado), no bloqueamos al usuario.
        }
    };

    /**
     * Banea al usuario por un número determinado de horas.
     * @param {number} durationHours - La duración del baneo en horas.
     */
    const banUser = (durationHours = config.banDurationHours) => {
        try {
            const expires = new Date().getTime() + durationHours * 60 * 60 * 1000;
            localStorage.setItem('flySecurityBan', JSON.stringify({ expires }));
            localStorage.removeItem('flySecurityWarning');
            checkBanStatus();
        } catch (e) {
            console.error("Fly Security: Could not ban user. localStorage might be disabled.", e);
        }
    };

    /**
     * Muestra un panel de advertencia por actividad sospechosa.
     * Si el usuario ya ha recibido una advertencia, es baneado.
     */
    const showWarningPanel = () => {
        if (document.getElementById(getSelector('warning-panel'))) return;

        try {
            if (localStorage.getItem('flySecurityWarning')) {
                banUser();
                return;
            }
            localStorage.setItem('flySecurityWarning', 'true');
        } catch (e) {
             console.error("Fly Security: localStorage not available for warnings.", e);
        }

        const panel = document.createElement('div');
        panel.id = getSelector('warning-panel');
        panel.innerHTML = `
             <header class="${getSelector('modal-header')}">
                <img src="${config.logoUrl}" alt="Logo">
                <h3>FLY SECURITY</h3>
            </header>
            <strong>Actividad Sospechosa Detectada</strong>
            <p>La repetición de esta acción resultará en un bloqueo temporal.</p>
        `;
        document.body.appendChild(panel);

        setTimeout(() => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(panel), 600);
        }, 5000);
    };

    // --- MÓDULOS DE PROTECCIÓN ---

    const protectionModules = {
        init() {
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.addEventListener('selectstart', e => e.preventDefault());
            document.addEventListener('copy', e => { e.preventDefault(); banUser(); });
            document.addEventListener('cut', e => { e.preventDefault(); banUser(); });

            // Detección de herramientas de desarrollador
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

            // Detección de acciones repetitivas
            let lastActions = { clicks: [], keys: [] };
            const detectRepetitiveAction = (type, time, count) => {
                const now = Date.now();
                lastActions[type].push(now);
                lastActions[type] = lastActions[type].filter(timestamp => now - timestamp < time);
                if (lastActions[type].length > count) {
                    showWarningPanel();
                    lastActions[type] = [];
                }
            };
            document.addEventListener('click', () => detectRepetitiveAction('clicks', config.actionThreshold.clicks.time, config.actionThreshold.clicks.count));
            document.addEventListener('keydown', () => detectRepetitiveAction('keys', config.actionThreshold.keys.time, config.actionThreshold.keys.count));
        }
    };

    // --- MÓDULO DE VERIFICACIÓN DE CONEXIÓN ---

    const connectionChecker = {
        timerId: null,
        secondsLeft: 30,
        init() {
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));
        },
        handleOffline() {
            if (this.timerId) return;

            const errorScreen = document.getElementById(getSelector('connection-error'));
            if (errorScreen) errorScreen.classList.add(getSelector('visible'));

            this.secondsLeft = 30;
            const timerElement = document.getElementById(getSelector('connection-timer'));
            if (timerElement) timerElement.textContent = this.secondsLeft;

            this.timerId = setInterval(() => {
                this.secondsLeft--;
                if (timerElement) timerElement.textContent = this.secondsLeft;
                if (this.secondsLeft <= 0) {
                    clearInterval(this.timerId);
                    window.location.href = config.errorRedirectUrl;
                }
            }, 1000);
        },
        handleOnline() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;

                const errorScreen = document.getElementById(getSelector('connection-error'));
                if (errorScreen) errorScreen.classList.remove(getSelector('visible'));

                this.showConnectionRecovered();
            }
        },
        showConnectionRecovered() {
            if (document.getElementById(getSelector('recovered-panel'))) return;
            const panel = document.createElement('div');
            panel.id = getSelector('recovered-panel');
            panel.innerHTML = `
                <strong>Conexión Recuperada</strong>
                <p>¡Bienvenido de nuevo!</p>
            `;
            document.body.appendChild(panel);

            setTimeout(() => {
                panel.style.opacity = '0';
                panel.style.transform = 'translateX(100%)';
                setTimeout(() => document.body.removeChild(panel), 600);
            }, 3000);
        }
    };

    // --- CONSTRUCCIÓN DE LA INTERFAZ Y ESTILOS ---

    /**
     * Inyecta todas las reglas de CSS necesarias en el <head> del documento.
     * Utiliza nombres de clases y IDs generados aleatoriamente.
     */
    const injectStyles = () => {
        if (document.getElementById(getSelector('styles'))) return;

        const styleSheet = document.createElement("style");
        styleSheet.id = getSelector('styles');
        styleSheet.textContent = `
            /* --- Importación de Fuente --- */
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

            /* --- Variables Globales y Estilos Base --- */
            :root {
                --fs-font: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                --fs-primary-color: #00bfff; /* DeepSkyBlue */
                --fs-error-color: #ff3b3b;
                --fs-warning-color: #ffa000;
                --fs-success-color: #4CAF50;
                --fs-dark-bg: #10121a;
                --fs-light-text: #e0e0e0;
                --fs-dark-text: #333;
            }

            /* --- Pantallas de Superposición (Baneo, Error de Conexión) --- */
            #${getSelector('ban-screen')}, #${getSelector('connection-error')} {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 2147483647; /* Máximo z-index */
                display: flex; justify-content: center; align-items: center;
                background: rgba(16, 18, 26, 0.7);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                font-family: var(--fs-font);
                color: var(--fs-light-text);
                text-align: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.5s ease, visibility 0.5s ease;
            }

            #${getSelector('ban-screen')} { /* La pantalla de baneo es siempre visible si se crea */
                opacity: 1;
                visibility: visible;
            }

            #${getSelector('connection-error')}.${getSelector('visible')} {
                 opacity: 1;
                 visibility: visible;
            }

            .${getSelector('modal-content')} {
                background: rgba(29, 35, 62, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 2rem;
                max-width: 90%;
                width: 500px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                transform: scale(0.95);
                transition: transform 0.4s ease;
            }
             #${getSelector('ban-screen')} .${getSelector('modal-content')},
             #${getSelector('connection-error')}.${getSelector('visible')} .${getSelector('modal-content')} {
                transform: scale(1);
            }

            .${getSelector('modal-header')} {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 1.5rem;
                gap: 12px;
            }
            .${getSelector('modal-header')} img {
                width: 40px;
                height: 40px;
            }
            .${getSelector('modal-header')} h1 {
                font-size: 1.2rem;
                margin: 0;
                color: var(--fs-light-text);
                font-weight: 600;
            }

            #${getSelector('ban-screen')} h2, #${getSelector('connection-error')} h2 {
                font-size: clamp(1.8rem, 5vw, 2.5rem);
                margin: 0 0 1rem;
                color: var(--fs-error-color);
            }
            #${getSelector('connection-error')} #_ {
                 font-size: 2.2rem;
                 color: var(--fs-warning-color);
                 margin-top: 1.5rem;
                 display: block;
             }

            /* --- Paneles de Notificación (Advertencia, Conexión Recuperada) --- */
            #${getSelector('warning-panel')}, #${getSelector('recovered-panel')} {
                position: fixed;
                top: 25px;
                right: 25px;
                z-index: 2147483646;
                background: rgba(29, 35, 62, 0.8);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: var(--fs-light-text);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1rem;
                width: 90%;
                max-width: 350px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                font-family: var(--fs-font);
                transition: opacity 0.5s ease, transform 0.5s ease;
                transform: translateX(120%);
                opacity: 1; /* Se anima desde el script */
            }
            
            /* Posicionamiento inicial animable */
            @media (min-width: 480px) {
              body:not(._fs_init) #${getSelector('warning-panel')},
              body:not(._fs_init) #${getSelector('recovered-panel')} {
                  transform: translateX(calc(100% + 30px));
              }
            }


            #${getSelector('warning-panel')} { border-left: 4px solid var(--fs-warning-color); }
            #${getSelector('recovered-panel')} { border-left: 4px solid var(--fs-success-color); background: rgba(30, 60, 40, 0.8);}
            #${getSelector('warning-panel')} strong, #${getSelector('recovered-panel')} strong { font-size: 1rem; }
            #${getSelector('warning-panel')} p, #${getSelector('recovered-panel')} p { margin: 4px 0 0; font-size: 0.9rem; opacity: 0.8; }
            #${getSelector('warning-panel')} .${getSelector('modal-header')} h3 { font-size: 1rem; margin: 0; }
            #${getSelector('warning-panel')} .${getSelector('modal-header')} img { width: 24px; height: 24px; }
            #${getSelector('warning-panel')} .${getSelector('modal-header')} { margin-bottom: 0.8rem; justify-content: flex-start;}

            /* --- Marca de Agua y Modal "Sitio Protegido" --- */
            #${getSelector('watermark-container')} {
                position: fixed;
                bottom: 15px; left: 15px;
                z-index: 2147483645;
                cursor: pointer;
            }
            #${getSelector('watermark-container')} img {
                width: 50px;
                height: 50px;
                transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), filter 0.3s ease;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
            }
            #${getSelector('watermark-container')}:hover img {
                transform: scale(1.1);
                filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
            }
            
            #${getSelector('protected-modal')} {
                /* Comparte estilos con las pantallas de superposición */
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 2147483647;
                display: flex; justify-content: center; align-items: center;
                background: rgba(16, 18, 26, 0.7);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                font-family: var(--fs-font);
                color: var(--fs-light-text);
                text-align: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.5s ease, visibility 0.5s ease;
            }
            #${getSelector('protected-modal')}.${getSelector('visible')} {
                 opacity: 1;
                 visibility: visible;
            }
             #${getSelector('protected-modal')} .shield-icon svg {
                width: 80px; height: 80px;
                stroke: var(--fs-primary-color);
                filter: drop-shadow(0 0 15px var(--fs-primary-color));
            }
            #${getSelector('protected-modal')} h2 {
                color: var(--fs-light-text);
                font-size: clamp(1.8rem, 5vw, 2.5rem);
                margin: 15px 0 10px;
            }
            
            /* --- Media Queries para Responsividad --- */
            @media (max-width: 768px) {
                .${getSelector('modal-content')} {
                    padding: 1.5rem;
                }
            }
            @media (max-width: 480px) {
                 #${getSelector('warning-panel')}, #${getSelector('recovered-panel')} {
                    top: 15px; right: 15px; left: 15px;
                    width: auto;
                    max-width: none;
                 }
                 #${getSelector('watermark-container')} {
                     bottom: 10px; left: 10px;
                 }
                 #${getSelector('watermark-container')} img {
                     width: 45px; height: 45px;
                 }
            }
        `;
        document.head.appendChild(styleSheet);
    };

    /**
     * Crea y añade todos los elementos de la UI al DOM.
     */
    const createUI = () => {
        // Marca de Agua
        const watermarkContainer = document.createElement('div');
        watermarkContainer.id = getSelector('watermark-container');
        watermarkContainer.innerHTML = `<img src="${config.logoUrl}" alt="Fly Security">`;
        document.body.appendChild(watermarkContainer);

        // Modal de "Sitio Protegido"
        const protectedModal = document.createElement('div');
        protectedModal.id = getSelector('protected-modal');
        protectedModal.innerHTML = `
            <div class="${getSelector('modal-content')}">
                <div class="shield-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" style="fill:rgba(0, 191, 255, 0.1);"></path>
                    </svg>
                </div>
                <h2>Sitio Protegido</h2>
                <p>Tu navegación es segura. Este sitio utiliza Fly Security para proteger el contenido.</p>
            </div>`;
        document.body.appendChild(protectedModal);

        // Pantalla de Error de Conexión
        const errorScreen = document.createElement('div');
        errorScreen.id = getSelector('connection-error');
        errorScreen.innerHTML = `
            <div class="${getSelector('modal-content')}">
                 <header class="${getSelector('modal-header')}">
                    <img src="${config.logoUrl}" alt="Logo">
                    <h1>FLY SECURITY V3.2</h1>
                </header>
                <h2>Conexión Perdida</h2>
                <p>Se ha interrumpido la conexión a la red. Intentando reconectar...</p>
                <p>Si la conexión no se recupera, serás redirigido en <strong id="${getSelector('connection-timer')}">30</strong> segundos.</p>
            </div>`;
        document.body.appendChild(errorScreen);

        // --- Event Listeners para la UI ---
        watermarkContainer.addEventListener('click', () => {
            protectedModal.classList.add(getSelector('visible'));
        });

        let pressTimer;
        watermarkContainer.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                window.open(config.creatorPage, '_blank');
            }, 1500);
        });
        watermarkContainer.addEventListener('mouseup', () => clearTimeout(pressTimer));
        watermarkContainer.addEventListener('mouseleave', () => clearTimeout(pressTimer));

        protectedModal.addEventListener('click', (e) => {
            if (e.target.id === getSelector('protected-modal')) {
                protectedModal.classList.remove(getSelector('visible'));
            }
        });
    };

    // --- INICIALIZACIÓN DEL SCRIPT ---
    
    /**
     * Función principal que se ejecuta cuando el DOM está listo.
     */
    const initialize = () => {
        // 1. Verificar si el usuario está baneado. Esto detendrá la ejecución si es true.
        try {
            checkBanStatus();
        } catch (e) {
            console.info(e.message);
            return; // Detiene toda la inicialización si el usuario está baneado
        }

        // 2. Inyectar los estilos CSS únicos.
        injectStyles();

        // 3. Crear los elementos de la interfaz.
        createUI();

        // 4. Activar los módulos de protección.
        protectionModules.init();

        // 5. Iniciar el verificador de conexión.
        connectionChecker.init();
        
        // 6. Añadir una clase al body para indicar que el script se ha cargado.
        // Esto previene flashes de contenido sin estilo en los paneles.
        requestAnimationFrame(() => {
            document.body.classList.add('_fs_init');
        });
    };

    // Esperar a que el DOM esté completamente cargado antes de ejecutar el script.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
