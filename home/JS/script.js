// Importar la base de datos de películas y series desde la URL proporcionada.
import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

/**
 * Crea el elemento HTML para una tarjeta de contenido (película o serie).
 * @param {object} item - El objeto de datos para el contenido (debe tener link, portada y nombre).
 * @returns {HTMLElement} - El elemento <a> que representa la tarjeta.
 */
function createContentCard(item) {
    const cardLink = document.createElement('a');
    // MEJORA 1: Se antepone la URL del reproductor al enlace del contenido.
    cardLink.href = `https://serviciosgenerales.zya.me/service.php?i=${item.link}`;
    cardLink.target = '_blank'; // Abrir en una nueva pestaña
    cardLink.classList.add('content-card');

    const imageUrl = item.portada && item.portada.startsWith('http') 
        ? item.portada 
        : 'https://i.ibb.co/wW3M9T4/placeholder.png'; // Placeholder mejorado

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
    
    containerElement.innerHTML = ''; // Limpiar antes de renderizar
    
    items.forEach(item => {
        const card = createContentCard(item);
        containerElement.appendChild(card);
    });
}

/**
 * MEJORA 2: Función para precargar imágenes.
 * Devuelve una promesa que se resuelve cuando todas las imágenes se han cargado (o han fallado).
 * @param {string[]} urls - Un array con las URLs de las imágenes a precargar.
 * @returns {Promise<void>}
 */
function preloadImages(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            // Resolvemos la promesa tanto si la imagen carga como si da error,
            // para no bloquear la visualización de la página por una imagen rota.
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    return Promise.all(promises);
}

/**
 * Función principal y asíncrona que se ejecuta al cargar la página.
 * Ahora gestiona la precarga de imágenes antes de mostrar el contenido.
 */
async function initializeApp() {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    
    // --- 1. Preparar los datos para todos los carruseles ---
    const recentlyAdded = [...peliculas]
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);
    
    const movies2025 = peliculas
        .filter(item => item.tipo === 'Película' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);
    
    const series2025 = peliculas
        .filter(item => item.tipo === 'Serie' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);

    const animes2025 = peliculas
        .filter(item => item.tipo === 'Anime' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);

    // --- 2. Recolectar todas las URLs de las portadas que se van a mostrar ---
    const allItems = [...recentlyAdded, ...movies2025, ...series2025, ...animes2025];
    const imageUrls = allItems.map(item => 
        item.portada && item.portada.startsWith('http') 
        ? item.portada 
        : 'https://i.ibb.co/wW3M9T4/placeholder.png'
    );
    
    // --- 3. Esperar a que todas las imágenes se precarguen ---
    await preloadImages(imageUrls);

    // --- 4. Renderizar los carruseles en el DOM (aún ocultos) ---
    renderCarousel(recentlyAdded, document.getElementById('recent-carousel'));
    renderCarousel(movies2025, document.getElementById('movies-2025-carousel'));
    renderCarousel(series2025, document.getElementById('series-2025-carousel'));
    renderCarousel(animes2025, document.getElementById('animes-2025-carousel'));
    
    // --- 5. Ocultar el preloader y mostrar el contenido principal con una transición suave ---
    preloader.classList.add('hidden');
    mainContent.classList.remove('hidden');
}

// Esperar a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', initializeApp);
