// Importar la base de datos de películas y series desde la URL proporcionada.
import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

/**
 * Crea el elemento HTML para una tarjeta de contenido (película o serie).
 * @param {object} item - El objeto de datos para el contenido (debe tener link, portada y nombre).
 * @returns {HTMLElement} - El elemento <a> que representa la tarjeta.
 */
function createContentCard(item) {
    const cardLink = document.createElement('a');
    cardLink.href = `https://serviciosgenerales.zya.me/service.php?i=${item.link}`;
    cardLink.target = '_blank';
    cardLink.classList.add('content-card');

    const imageUrl = item.portada && item.portada.startsWith('http') 
        ? item.portada 
        : 'https://i.ibb.co/wW3M9T4/placeholder.png';

    cardLink.innerHTML = `
        <div class="card-image-container">
            <img src="${imageUrl}" alt="Portada de ${item.nombre}" loading="lazy">
        </div>
        <h3>${item.nombre}</h3>
    `;
    
    return cardLink;
}

/**
 * Renderiza una lista de elementos en un contenedor de carrusel específico.
 * @param {Array<object>} items - La lista de elementos de contenido a renderizar.
 * @param {HTMLElement} containerElement - El elemento del DOM donde se insertarán las tarjetas.
 */
function renderCarousel(items, containerElement) {
    if (!containerElement) {
        console.error('El contenedor para el carrusel no fue encontrado.');
        return;
    }
    
    containerElement.innerHTML = '';
    
    items.forEach(item => {
        const card = createContentCard(item);
        containerElement.appendChild(card);
    });
    
    // Iniciar el desplazamiento automático del carrusel después de renderizar
    startAutoScroll(containerElement);
}

/**
 * Función para precargar imágenes.
 * @param {string[]} urls - Un array con las URLs de las imágenes a precargar.
 * @returns {Promise<void>}
 */
function preloadImages(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    return Promise.all(promises);
}

/**
 * Inicia el desplazamiento automático de un carrusel.
 * @param {HTMLElement} carousel - El elemento del carrusel.
 */
function startAutoScroll(carousel) {
    let scrollSpeed = 0.2; // Velocidad del desplazamiento, reducida para un efecto más lento y elegante
    let scrollInterval;
    let isPaused = false;
    
    const scroll = () => {
        if (!isPaused) {
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1) {
                // Volver al inicio si llega al final
                carousel.scrollLeft = 0;
            } else {
                carousel.scrollLeft += scrollSpeed;
            }
        }
    };
    
    scrollInterval = setInterval(scroll, 16); // ~60fps
    
    const pauseScroll = () => {
        isPaused = true;
    };

    const resumeScroll = () => {
        isPaused = false;
    };

    carousel.addEventListener('mouseenter', pauseScroll);
    carousel.addEventListener('mouseleave', resumeScroll);
    
    // Mejorar el manejo táctil
    carousel.addEventListener('touchstart', (e) => {
        // Pausar el scroll
        pauseScroll();
        
        // Manejar el "zoom" del título en móviles
        const cards = document.querySelectorAll('.content-card');
        cards.forEach(card => card.classList.remove('active')); // Eliminar la clase activa de todas las tarjetas
        const touchedCard = e.target.closest('.content-card');
        if (touchedCard) {
            touchedCard.classList.add('active'); // Agregar la clase activa a la tarjeta tocada
        }
    });

    carousel.addEventListener('touchend', resumeScroll);
}

async function initializeApp() {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    
    // --- Aumento el límite a 12 elementos ---
    const recentlyAdded = [...peliculas]
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 12); // MODIFICADO
    
    const movies2025 = peliculas
        .filter(item => item.tipo === 'Película' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 12); // MODIFICADO
    
    const series2025 = peliculas
        .filter(item => item.tipo === 'Serie' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 12); // MODIFICADO

    const animes2025 = peliculas
        .filter(item => item.tipo === 'Anime' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 12); // MODIFICADO

    const allItems = [...recentlyAdded, ...movies2025, ...series2025, ...animes2025];
    const imageUrls = allItems.map(item => 
        item.portada && item.portada.startsWith('http') 
        ? item.portada 
        : 'https://i.ibb.co/wW3M9T4/placeholder.png'
    );
    
    await preloadImages(imageUrls);

    renderCarousel(recentlyAdded, document.getElementById('recent-carousel'));
    renderCarousel(movies2025, document.getElementById('movies-2025-carousel'));
    renderCarousel(series2025, document.getElementById('series-2025-carousel'));
    renderCarousel(animes2025, document.getElementById('animes-2025-carousel'));
    
    preloader.classList.add('hidden');
    mainContent.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', initializeApp)
