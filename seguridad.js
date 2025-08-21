/* NOTA: Este cÃ³digo debe ser ofuscado antes de pasar a producciÃ³n para dificultar la ingenierÃ­a inversa. */

(function() {
    'use strict';

    // ---- CONFIGURACIÃ“N ----
    const BACKEND_URL = "http://flysegurity.zya.me/api/verificador.php"; // URL de tu backend
    const BANNED_FLAG = 'fly_banned';
    let isBanned = false; // Flag para evitar mÃºltiples llamadas

    // ---- MÃ“DULO 1: PROTOCOLO DE BLOQUEO Y PANTALLA DE BANEO ----

    /**
     * Muestra la pantalla de baneo reemplazando todo el contenido de la pÃ¡gina.
     * Esta acciÃ³n es destructiva y detiene la mayorÃ­a de los scripts en ejecuciÃ³n.
     */
    function showBanScreen() {
        const banHTML = `
            <head>
                <title>Acceso Denegado</title>
                <style>
                    body { background-color: #121212; color: #f0f0f0; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
                    .container { max-width: 600px; padding: 20px; }
                    h1 { color: #ff4444; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Acceso Restringido</h1>
                    <p>Por la seguridad de nuestros servicios, usted ha sido baneado temporalmente (24 horas).</p>
                </div>
            </body>
        `;
        document.documentElement.innerHTML = banHTML;
    }

    /**
     * Protocolo de bloqueo completo. Reporta la IP, establece la bandera local
     * y neutraliza la pÃ¡gina.
     */
    async function triggerBanProtocol() {
        if (isBanned) return; // Si ya se estÃ¡ procesando un baneo, no hacer nada.
        isBanned = true;

        // Paso 1: Reportar la IP al backend (sin esperar respuesta para ser mÃ¡s rÃ¡pido)
        fetch(`${BACKEND_URL}?action=reportar`, { mode: 'no-cors' }).catch(err => console.error('FlySegurity: Error al reportar IP.'));

        // Paso 2: Almacenar la bandera de baneo en el almacenamiento local.
        try {
            localStorage.setItem(BANNED_FLAG, 'true');
        } catch (e) {
            console.error('FlySegurity: No se pudo escribir en localStorage.');
        }

        // Paso 3: Neutralizar la pÃ¡gina mostrando la pantalla de baneo.
        showBanScreen();
    }


    // ---- MÃ“DULO 2: VERIFICACIÃ“N INICIAL AL CARGAR ----

    /**
     * Verifica el estado de baneo al cargar el script.
     * Primero revisa localmente, luego consulta al servidor.
     */
    async function initialVerification() {
        // 1. Verificar si la bandera de baneo ya existe en localStorage.
        try {
            if (localStorage.getItem(BANNED_FLAG) === 'true') {
                isBanned = true;
                showBanScreen();
                return;
            }
        } catch (e) {
            // localStorage podrÃ­a estar deshabilitado
        }

        // 2. Si no hay bandera local, consultar al servidor.
        try {
            const response = await fetch(`${BACKEND_URL}?action=verificar`);
            const data = await response.json();
            if (data.banned) {
                // Si el servidor confirma el baneo, activar el protocolo local.
                await triggerBanProtocol();
            }
        } catch (error) {
            console.error('FlySegurity: No se pudo verificar la IP con el servidor.', error);
        }
    }


    // ---- MÃ“DULO 3: DETECCIÃ“N DE ACTIVIDAD MALICIOSA ----

    // 3.1. DetecciÃ³n de Herramientas de Desarrollo (F12)
    const devToolsCheck = () => {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
            triggerBanProtocol();
        }
    };
    // Ejecutar la comprobaciÃ³n periÃ³dicamente
    setInterval(devToolsCheck, 1000);


    // 3.2. Bloqueo de Atajos de Teclado y MenÃº Contextual
    document.addEventListener('keydown', e => {
        // Bloquear Ctrl+U, Ctrl+S y Ctrl+Shift+I/J/C
        if ((e.ctrlKey && (e.key === 'u' || e.key === 's')) ||
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
            e.preventDefault();
            triggerBanProtocol();
        }
    });

    document.addEventListener('keyup', e => {
        // Detectar Imprimir Pantalla
        if (e.key === 'PrintScreen') {
            triggerBanProtocol();
        }
    });

    // Deshabilitar menÃº contextual (clic derecho)
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        triggerBanProtocol();
    });


    // ---- MÃ“DULO 4: MARCA DE AGUA (WATERMARK) ----

    function addWatermark() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '15px';
        container.style.left = '15px';
        container.style.zIndex = '2147483647';
        container.style.background = 'transparent';
        container.style.pointerEvents = 'none'; // El contenedor no captura clics

        const link = document.createElement('a');
        link.href = 'http://flysegurity.zya.me';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.pointerEvents = 'auto'; // El enlace sÃ­ captura clics

        const logo = document.createElement('img');
        logo.src = 'https://i.ibb.co/jkQWRSkM/Fly-Segurity.png';
        logo.alt = 'FlySegurity';
        logo.style.width = '120px'; // Ajusta el tamaÃ±o segÃºn sea necesario
        logo.style.border = 'none';
        logo.style.display = 'block';

        link.appendChild(logo);
        container.appendChild(link);
        document.body.appendChild(container);
    }

    // ---- INICIALIZACIÃ“N ----
// Aplicar estilos de protecciÃ³n visual inmediatamente
applyProtectiveStyles();
// Ejecutar verificaciÃ³n inicial tan pronto como sea posible
initialVerification();
// AÃ±adir la marca de agua cuando el DOM estÃ© listo
document.addEventListener('DOMContentLoaded', addWatermark);

// ---- MÃ“DULO DE ESTILOS Y PROTECCIÃ“N VISUAL ----
}
/**
 * Inyecta CSS en la pÃ¡gina para deshabilitar la selecciÃ³n de texto
 * y mejorar la experiencia visual de la protecciÃ³n.
 */
function applyProtectiveStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body, html {
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10+ */
            user-select: none; /* EstÃ¡ndar */
        }
    `;
    document.head.appendChild(style);

})();
