// Importar la base de datos de películas y series desde la URL proporcionada.
import { peliculas } from 'https://moc3pnj.github.io/bd/data.js';

/**
 * Crea el elemento HTML para una tarjeta de contenido (película o serie).
 * @param {object} item - El objeto de datos para el contenido (debe tener link, portada y nombre).
 * @returns {HTMLElement} - El elemento <a> que representa la tarjeta.
 */
function createContentCard(item) {
    // Crear el contenedor principal, que es un enlace <a>
    const cardLink = document.createElement('a');
    cardLink.href = item.link;
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
    
    // Limpiar el contenedor antes de agregar nuevos elementos
    containerElement.innerHTML = '';
    
    items.forEach(item => {
        const card = createContentCard(item);
        containerElement.appendChild(card);
    });
}

/**
 * Función principal que se ejecuta al cargar la página para poblar todos los carruseles.
 */
function initializeApp() {
    // --- 1. Lógica para "Recién Agregadas" ---
    // Ordena toda la base de datos por 'id' en orden descendente y toma los primeros 10.
    const recentlyAdded = [...peliculas]
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);
    renderCarousel(recentlyAdded, document.getElementById('recent-carousel'));
    
    // --- 2. Lógica para "Movies 2025" ---
    // Filtra por tipo 'Película' y año 2025, ordena por id y toma los primeros 10.
    const movies2025 = peliculas
        .filter(item => item.tipo === 'Película' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);
    renderCarousel(movies2025, document.getElementById('movies-2025-carousel'));
    
    // --- 3. Lógica para "Series 2025" ---
    // Filtra por tipo 'Serie' y año 2025, ordena por id y toma los primeros 10.
    const series2025 = peliculas
        .filter(item => item.tipo === 'Serie' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);
    renderCarousel(series2025, document.getElementById('series-2025-carousel'));

    // --- 4. Lógica para "Animes 2025" ---
    // Filtra por tipo 'Anime' y año 2025, ordena por id y toma los primeros 10.
    const animes2025 = peliculas
        .filter(item => item.tipo === 'Anime' && item.año === 2025)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 10);
    renderCarousel(animes2025, document.getElementById('animes-2025-carousel'));
}

// Esperar a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', initializeApp);
