
let heroes = [];
let filteredHeroes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentHeroId = 1;
const apiKey = '973d08d93973bf81a87693a000b50abb';
const heroesPerLoad = 15; 


document.addEventListener('DOMContentLoaded', () => {
    fetchHeroes(currentHeroId, heroesPerLoad);
    displayFavorites(); 

   
    document.getElementById('filter-input').addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        filteredHeroes = heroes.filter(hero => hero.name.toLowerCase().includes(searchTerm));
        displayHeroes(filteredHeroes); 
    });

   
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            currentHeroId += heroesPerLoad;
            fetchHeroes(currentHeroId, heroesPerLoad);
        }
    });
});


async function fetchHeroes(startId, amount) {
    try {
        const promises = [];

        
        for (let i = startId; i < startId + amount; i++) {
            promises.push(fetch(`https://www.superheroapi.com/api.php/${apiKey}/${i}`).then(res => res.json()));
        }

        
        const newHeroes = await Promise.all(promises);

        
        const validHeroes = newHeroes.filter(hero => hero.response !== 'error');
        heroes = [...heroes, ...validHeroes];

        
        displayHeroes(filteredHeroes.length > 0 ? filteredHeroes : heroes);
    } catch (error) {
        console.error('Erro ao buscar heróis:', error);
    }
}


function displayHeroes(heroesToDisplay) {
    const list = document.getElementById('heroes-list');
    list.innerHTML = '';

   
    heroesToDisplay.map(hero => {
        const item = document.createElement('div');
        item.className = 'hero-item';
        item.innerHTML = `
            <div class="hero-image-container">
                <img src="${hero.image.url}" alt="${hero.name}" width="100">
                <div class="hero-hover-info" style="display:none;">
                    <p>Poder: ${hero.powerstats.power || 'Desconhecido'}</p>
                </div>
            </div>
            <h3>${hero.name}</h3>
            <button class="favorite-btn ${isFavorite(hero) ? 'active' : ''}">
                ${isFavorite(hero) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </button>
        `;

        
        const imgContainer = item.querySelector('.hero-image-container');
        const img = imgContainer.querySelector('img');
        const hoverInfo = imgContainer.querySelector('.hero-hover-info');

        
        img.addEventListener('mouseenter', () => {
            img.style.opacity = '0.7'; 
            hoverInfo.style.display = 'block'; 
        });
        img.addEventListener('mouseleave', () => {
            img.style.opacity = '1'; 
            hoverInfo.style.display = 'none'; 
        });

        item.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(hero));
        list.appendChild(item);
    });

    
    if (heroesToDisplay.length === 0) {
        list.innerHTML = '<p>Nenhum herói encontrado.</p>';
    }
}


function toggleFavorite(hero) {
    if (isFavorite(hero)) {
        favorites = favorites.filter(fav => fav.id !== hero.id);
    } else {
        favorites.push(hero);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    displayHeroes(filteredHeroes.length ? filteredHeroes : heroes);
}


function isFavorite(hero) {
    return favorites.some(fav => fav.id === hero.id);
}


function displayFavorites() {
    const list = document.getElementById('favorites-list');
    list.innerHTML = '';
    favorites.forEach(fav => {
        const item = document.createElement('li');
        item.textContent = fav.name;
        list.appendChild(item);
    });
}
