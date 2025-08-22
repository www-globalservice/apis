/**
 * Fly Security v2.0 - Professional Edition
 * Un sistema de seguridad web mejorado con enfoque en la disuasión, la experiencia de usuario y una estética profesional.
 * Incluye un panel de estado animado, integración de Animate.css y estilos optimizados.
 */

(function() {
    // --- CONFIGURACIÓN INICIAL ---
    const config = {
        // URL a la que redirige el logo. ¡Cámbiala por tu página!
        creatorPage: "https://tu-pagina-web.com",
        // URL del logo para la marca de agua (opcional, ahora usamos SVG)
        logoUrl: "https://i.ibb.co/jkQWRSkM/Fly-Segurity.png",
        // Sensibilidad para la detección de acciones repetitivas
        actionThreshold: {
            clicks: { count: 20, time: 3000 }, // 20 clicks en 3s
            keys: { count: 30, time: 3000 }   // 30 pulsaciones en 3s
        }
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
            #fly-security-watermark {
                position: fixed; bottom: 15px; left: 15px;
                z-index: 99998; cursor: pointer;
            }
            #fly-security-watermark img {
                width: 50px; height: 50px;
                transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            #fly-security-watermark:hover img {
                transform: scale(1.1);
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
        `;
        document.head.appendChild(styleSheet);
    };

    const createWatermarkAndModal = () => {
        // Contenedor de la marca de agua
        const watermark = document.createElement('a');
        watermark.id = 'fly-security-watermark';
        
        const logo = document.createElement('img');
        logo.src = config.logoUrl;
        watermark.appendChild(logo);
        document.body.appendChild(watermark);
        
        // Modal de "Sitio Protegido"
        const modal = document.createElement('div');
        modal.id = 'fly-protected-modal';
        modal.innerHTML = `
            <div class="fly-modal-content animate__animated">
                <div class="shield-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" style="fill:rgba(0, 191, 255, 0.2); stroke: #00bfff;"></path></svg>
                </div>
                <h2>Sitio Protegido</h2>
                <p>Tu navegación es segura. Este sitio utiliza Fly Security para proteger su contenido contra copias y actividades no autorizadas.</p>
            </div>
        `;
        document.body.appendChild(modal);

        // Event Listeners
        watermark.addEventListener('click', (e) => {
            e.preventDefault(); // Previene la redirección si se hace clic
            modal.classList.add('visible');
            modal.querySelector('.fly-modal-content').classList.add('animate__zoomIn');
            modal.querySelector('.fly-modal-content').classList.remove('animate__zoomOut');
        });
        
        // Cierra el modal si se hace clic en el fondo
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                 modal.querySelector('.fly-modal-content').classList.remove('animate__zoomIn');
                 modal.querySelector('.fly-modal-content').classList.add('animate__zoomOut');
                 setTimeout(() => {
                    modal.classList.remove('visible');
                 }, 500); // Duración de la animación de salida
            }
        });
        
        // Redirección solo si se mantiene presionado (opcional, como un "easter egg")
        let pressTimer;
        watermark.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                window.open(config.creatorPage, '_blank');
            }, 1500); // 1.5 segundos para abrir la página del creador
        });
        watermark.addEventListener('mouseup', () => clearTimeout(pressTimer));
        watermark.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    };


    // --- INICIALIZACIÓN ---
    document.addEventListener('DOMContentLoaded', () => {
        checkBanStatus();
        injectStylesAndAnimateCSS();
        createWatermarkAndModal();
    });

})();
