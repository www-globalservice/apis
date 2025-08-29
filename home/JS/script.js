// Importar la base de datos de películas y series desde la URL proporcionada.
import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

/**
 * Crea el elemento HTML para una tarjeta de contenido (película o serie).
 * La URL del contenido ahora se antepone con el enlace del reproductor.
 * @param {object} item - El objeto de datos para el contenido.
 * @returns {HTMLElement} - El elemento <a> que representa la tarjeta.
 */
function createContentCard(item) {
    // Crear el contenedor principal, que es un enlace <a>
    const cardLink = document.createElement('a');
    // MEJORA 1: Se antepone la URL del reproductor al enlace del contenido.
    cardLink.href = `https://serviciosgenerales.zya.me/service.php?i=${item.link}`;
    cardLink.target = '_blank'; // Abrir en una nueva pestaña
    cardLink.classList.add('content-card');
    
    // Usar una imagen de placeholder si la portada no es una URL válida
    const imageUrl = item.portada && item.portada.startsWith('http') 
        ? item.portada 
        : 'https://i.ibb.co/mV5542W3/images.png';

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
    
    containerElement.innerHTML = ''; // Limpiar el contenedor
    
    items.forEach(item => {
        const card = createContentCard(item);
        containerElement.appendChild(card);
    });
}

/**
 * MEJORA 2: Función para precargar imágenes.
 * Toma un array de URLs de imágenes y devuelve una promesa que se resuelve
 * cuando todas las imágenes se han cargado.
 * @param {string[]} urls - Array de URLs de imágenes.
 * @returns {Promise<any>}
 */
function preloadImages(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve; // Resolvemos incluso en error para no bloquear la app
        });
    });
    return Promise.all(promises);
}


/**
 * Función principal que se ejecuta al cargar la página.
 * Ahora incluye la lógica de precarga de imágenes.
 */
async function initializeApp() {
    const mainContent = document.querySelector('main');
    const loader = document.getElementById('loader');

    // Ocultar el contenido principal y mostrar el loader
    mainContent.style.display = 'none';
    loader.style.display = 'flex';

    // --- 1. Definir los datos para cada carrusel ---
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

    // --- 2. Recopilar todas las URLs de imágenes para precargar ---
    const allItems = [...recentlyAdded, ...movies2025, ...series2025, ...animes2025];
    const imageUrls = [...new Set( // Usamos Set para no cargar imágenes duplicadas
        allItems.map(item => item.portada && item.portada.startsWith('http') 
            ? item.portada 
            : 'https://i.ibb.co/mV5542W3/images.png'
        )
    )];

    // --- 3. Esperar a que todas las imágenes se carguen ---
    await preloadImages(imageUrls);

    // --- 4. Renderizar los carruseles ---
    renderCarousel(recentlyAdded, document.getElementById('recent-carousel'));
    renderCarousel(movies2025, document.getElementById('movies-2025-carousel'));
    renderCarousel(series2025, document.getElementById('series-2025-carousel'));
    renderCarousel(animes2025, document.getElementById('animes-2025-carousel'));

    // --- 5. Ocultar el loader y mostrar el contenido ya cargado ---
    loader.style.display = 'none';
    mainContent.style.display = 'block';
}

// Esperar a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', initializeApp);
