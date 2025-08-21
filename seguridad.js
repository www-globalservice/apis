/**
 * Fly Segurity v1.0
 * Un sistema de seguridad web en JavaScript para proteger el contenido de tu página.
 * Creado con un enfoque en la disuasión y la experiencia de usuario.
 */

(function() {
    // --- CONFIGURACIÓN INICIAL ---
    const config = {
        // URL a la que redirige el logo. ¡Cámbiala por tu página!
        creatorPage: "https://tu-pagina-web.com",
        // URL del logo de Fly Segurity
        logoUrl: "https://i.ibb.co/jkQWRSkM/Fly-Segurity.png",
        // Sensibilidad para la detección de acciones repetitivas (menos es más sensible)
        actionThreshold: {
            clicks: { count: 20, time: 3000 }, // 20 clicks en 3 segundos
            keys: { count: 30, time: 3000 }   // 30 pulsaciones en 3 segundos
        }
    };

    // --- LÓGICA DE SEGURIDAD ---

    // 1. VERIFICACIÓN DE BANEO
    const checkBanStatus = () => {
        const banInfo = JSON.parse(localStorage.getItem('flySegurityBan'));
        if (banInfo && new Date().getTime() < banInfo.expires) {
            const remainingTime = Math.ceil((banInfo.expires - new Date().getTime()) / (1000 * 60 * 60));
            document.body.innerHTML = `
                <div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color: #111; color: #fff; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family: sans-serif; z-index: 99999;">
                    <h1 style="font-size: 2.5rem; color: #ff4d4d;">Acceso Bloqueado</h1>
                    <p style="font-size: 1.2rem; margin-top: 10px;">Tu acceso a este sitio ha sido suspendido temporalmente por actividad sospechosa.</p>
                    <p style="font-size: 1rem; margin-top: 20px;">Podrás volver a intentarlo en aproximadamente ${remainingTime} horas.</p>
                </div>`;
            // Detiene la ejecución de cualquier otro script
            throw new Error("User is banned.");
        }
    };

    // 2. FUNCIÓN DE BANEO
    const banUser = (durationHours = 24) => {
        const expires = new Date().getTime() + durationHours * 60 * 60 * 1000;
        localStorage.setItem('flySegurityBan', JSON.stringify({ expires }));
        localStorage.removeItem('flySegurityWarning'); // Limpia advertencias previas
        checkBanStatus(); // Aplica el bloqueo inmediatamente
    };

    // 3. PANEL DE ADVERTENCIA
    const showWarningPanel = () => {
        if (document.getElementById('fly-warning-panel')) return; // No mostrar si ya está visible

        const panel = document.createElement('div');
        panel.id = 'fly-warning-panel';
        panel.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">⚠️ Actividad Sospechosa Detectada</div>
            <div>Se ha registrado un comportamiento anómalo. La repetición de esta actividad resultará en un bloqueo temporal de tu acceso.</div>
        `;
        // Estilos del panel
        Object.assign(panel.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#ffc107',
            color: '#333',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            zIndex: '100000',
            fontFamily: 'sans-serif',
            maxWidth: '350px',
            borderLeft: '5px solid #ff9800'
        });

        document.body.appendChild(panel);

        setTimeout(() => {
            panel.style.transition = 'opacity 0.5s ease';
            panel.style.opacity = '0';
            setTimeout(() => document.body.removeChild(panel), 500);
        }, 5000); // El panel desaparece después de 5 segundos

        // Lógica de advertencia/baneo
        const hasBeenWarned = localStorage.getItem('flySegurityWarning');
        if (hasBeenWarned) {
            banUser();
        } else {
            localStorage.setItem('flySegurityWarning', 'true');
        }
    };


    // --- MÓDULOS DE PROTECCIÓN ---

    // 4. ANTI-COPIADO Y CLIC DERECHO
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('copy', e => {
        e.preventDefault();
        banUser(); // Falta grave, baneo inmediato
    });
     document.addEventListener('cut', e => {
        e.preventDefault();
        banUser(); // Falta grave, baneo inmediato
    });

    // 5. ANTI-HERRAMIENTAS DE DESARROLLADOR Y ATAJOS
    let devToolsOpen = false;
    const devToolsDetector = () => {
        // Este es un truco común, no es infalible pero disuade
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                banUser(); // Falta grave, baneo inmediato
            }
        }
    };
    // Revisar periódicamente
    setInterval(devToolsDetector, 1000);

    document.addEventListener('keydown', e => {
        // Bloquear F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toUpperCase() === 'U')) {
            e.preventDefault();
            banUser(); // Falta grave, baneo inmediato
        }
        // Bloquear Ctrl+P (Imprimir) que puede usarse para guardar como PDF
        if (e.ctrlKey && e.key.toUpperCase() === 'P') {
            e.preventDefault();
        }
    });

    // 6. DETECCIÓN DE ACCIONES REPETITIVAS (AUTOMATIZACIÓN)
    let lastActions = { clicks: [], keys: [] };

    const detectRepetitiveAction = (type, time) => {
        const now = new Date().getTime();
        const actions = lastActions[type];
        actions.push(now);

        // Filtra las acciones que están fuera de la ventana de tiempo
        lastActions[type] = actions.filter(timestamp => now - timestamp < time);

        // Si el número de acciones supera el umbral, activa la advertencia
        if (lastActions[type].length > config.actionThreshold[type].count) {
            showWarningPanel();
            lastActions[type] = []; // Resetea el contador para no lanzar múltiples advertencias
        }
    };

    document.addEventListener('click', () => detectRepetitiveAction('clicks', config.actionThreshold.clicks.time));
    document.addEventListener('keydown', () => detectRepetitiveAction('keys', config.actionThreshold.keys.time));


    // --- MARCA DE AGUA ESTÉTICA ---

    const createWatermark = () => {
        const watermark = document.createElement('a');
        watermark.href = config.creatorPage;
        watermark.target = '_blank';
        watermark.id = 'fly-segurity-watermark';

        const logo = document.createElement('img');
        logo.src = config.logoUrl;
        Object.assign(logo.style, {
            width: '50px',
            height: '50px',
            transition: 'transform 0.3s ease'
        });

        const protectedText = document.createElement('div');
        protectedText.textContent = 'Página Protegida y Encriptada';
        Object.assign(protectedText.style, {
            position: 'absolute',
            bottom: '120%', // Posicionado encima del logo
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            opacity: '0',
            visibility: 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease'
        });

        watermark.appendChild(logo);
        watermark.appendChild(protectedText);
        document.body.appendChild(watermark);

        // Estilos del contenedor de la marca de agua
        Object.assign(watermark.style, {
            position: 'fixed',
            bottom: '15px',
            left: '15px',
            zIndex: '99998',
            cursor: 'pointer',
            textDecoration: 'none'
        });

        // Animación al mantener presionado
        let pressTimer;
        watermark.addEventListener('mousedown', () => {
            logo.style.transform = 'scale(1.2)';
            protectedText.style.visibility = 'visible';
            protectedText.style.opacity = '1';
            pressTimer = setTimeout(() => {
                // Si quieres que pase algo después de un tiempo largo, ponlo aquí
            }, 1000);
        });
        watermark.addEventListener('mouseup', () => {
            logo.style.transform = 'scale(1)';
            protectedText.style.opacity = '0';
            protectedText.style.visibility = 'hidden';
            clearTimeout(pressTimer);
        });
        watermark.addEventListener('mouseleave', () => { // También si el mouse se va
            logo.style.transform = 'scale(1)';
            protectedText.style.opacity = '0';
            protectedText.style.visibility = 'hidden';
            clearTimeout(pressTimer);
        });
    };

    // --- INICIALIZACIÓN ---
    document.addEventListener('DOMContentLoaded', () => {
        checkBanStatus();
        createWatermark();
    });

})();
