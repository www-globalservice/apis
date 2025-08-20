    (function() {
        'use strict';

        // ---- CONFIGURACIÓN ----
        const WATERMARK_TEXT = "SECURITY";
        const WATERMARK_LOGO_URL = "https://i.ibb.co/wRC22Rb/proteger.png";
        const ADBLOCK_REDIRECT_URL = "https://tu-pagina-de-aviso.com/adblock"; // Opcional

        // ---- MÓDULO 1: ANTI-CAPTURAS Y HERRAMIENTAS DE DESARROLLO ----

        // Detección de apertura de herramientas de desarrollo (F12, Ctrl+Shift+I, etc.)
        const devtools = {
            isOpen: false,
            orientation: null,
        };

        const threshold = 160;

        const emitEvent = (isOpen, orientation) => {
            window.dispatchEvent(new CustomEvent("devtoolschange", {
                detail: {
                    isOpen,
                    orientation,
                },
            }));
        };

        const main = ({
            emitEvents = true
        } = {}) => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            const orientation = widthThreshold ? "vertical" : "horizontal";

            if (!(heightThreshold && widthThreshold) &&
                ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
                if ((!devtools.isOpen || devtools.orientation !== orientation) && emitEvents) {
                    emitEvent(true, orientation);
                }
                devtools.isOpen = true;
                devtools.orientation = orientation;
            } else {
                if (devtools.isOpen && emitEvents) {
                    emitEvent(false, null);
                }
                devtools.isOpen = false;
                devtools.orientation = null;
            }
        };

        main({
            emitEvents: false
        });
        setInterval(main, 500);

        // Acción al detectar las herramientas de desarrollo
        window.addEventListener("devtoolschange", event => {
            if (event.detail.isOpen) {
                // Ofusca el contenido para dificultar la lectura
                document.body.innerHTML = "<div style='text-align:center; margin-top: 50px;'><h1>Acción no permitida detectada.</h1><p>El contenido ha sido protegido.</p></div>";
            }
        });

        // Detección de la tecla "Imprimir Pantalla"
        document.addEventListener('keyup', (e) => {
            if (e.key == 'PrintScreen') {
                navigator.clipboard.writeText(''); // Intenta limpiar el portapapeles
                alert("Las capturas de pantalla están deshabilitadas.");
            }
        });
        
        // Bloqueo de atajos de teclado comunes para ver código fuente y guardar
        document.addEventListener('keydown', function(e) {
            if (
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || // Ctrl+Shift+I/J/C
                (e.ctrlKey && e.key === 'U') || // Ctrl+U
                (e.ctrlKey && e.key === 'S')    // Ctrl+S
            ) {
                e.preventDefault();
                alert("Esta función está deshabilitada por seguridad.");
            }
        });


        // ---- MÓDULO 2: ANTI-COPIAR Y SELECCIONAR ----

        // Deshabilitar selección de texto, clic derecho y arrastrar
        document.addEventListener('contextmenu', event => event.preventDefault());
        document.onselectstart = () => false;
        document.ondragstart = () => false;
        
        // Aplicar estilos CSS para evitar la selección
        const antiCopyStyles = document.createElement('style');
        antiCopyStyles.innerHTML = `
            body, html {
                -webkit-user-select: none; /* Safari */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* IE10+/Edge */
                user-select: none; /* Estándar */
                -webkit-touch-callout: none; /* iOS Safari */
            }
        `;
        document.head.appendChild(antiCopyStyles);


        // ---- MÓDULO 3: DETECCIÓN DE ADBLOCK ----
        
        function detectAdBlock() {
            const adBlockTest = document.createElement('div');
            adBlockTest.innerHTML = '&nbsp;';
            adBlockTest.className = 'adsbox'; // Nombre de clase común que los AdBlockers bloquean
            adBlockTest.style.position = 'absolute';
            adBlockTest.style.left = '-5000px';
            adBlockTest.style.width = '1px';
            adBlockTest.style.height = '1px';

            document.body.appendChild(adBlockTest);

            setTimeout(function() {
                if (adBlockTest.offsetHeight === 0) {
                    // AdBlock detectado
                    document.body.innerHTML = `
                        <div style='position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); color:white; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index: 9999;'>
                            <h1 style='font-size: 2em;'>AdBlock Detectado</h1>
                            <p style='font-size: 1.2em; max-width: 600px; text-align: center;'>Para continuar, por favor deshabilita tu bloqueador de anuncios y recarga la página. Este sitio se financia gracias a la publicidad.</p>
                        </div>
                    `;
                }
                // Limpiar el elemento de prueba
                document.body.removeChild(adBlockTest);
            }, 100);
        }

        // Ejecutar la detección después de que la página cargue
        window.onload = detectAdBlock;


        // ---- MÓDULO 4: MARCA DE AGUA ----
        
        function addWatermark() {
            const watermarkDiv = document.createElement('div');
            watermarkDiv.id = 'security-watermark';
            watermarkDiv.style.position = 'fixed';
            watermarkDiv.style.bottom = '10px';
            watermarkDiv.style.left = '10px';
            watermarkDiv.style.zIndex = '9998'; // Un poco menos que el bloqueo de AdBlock
            watermarkDiv.style.display = 'flex';
            watermarkDiv.style.alignItems = 'center';
            watermarkDiv.style.padding = '5px 8px';
            watermarkDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            watermarkDiv.style.borderRadius = '5px';
            watermarkDiv.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
            watermarkDiv.style.pointerEvents = 'none'; // Para no interferir con clics
            watermarkDiv.style.fontFamily = 'Arial, sans-serif';
            watermarkDiv.style.fontSize = '12px';

            const logo = document.createElement('img');
            logo.src = WATERMARK_LOGO_URL;
            
            logo.style.width = '16px';
            logo.style.height = '16px';
            logo.style.marginRight = '8px';
            
            const text = document.createElement('span');
            text.textContent = WATERMARK_TEXT;
            
            watermarkDiv.appendChild(logo);
            watermarkDiv.appendChild(text);
            
            document.body.appendChild(watermarkDiv);
        }

        // Añadir la marca de agua cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', addWatermark);

    })();
