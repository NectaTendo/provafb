//definindo itens 
let heroes = [];
let filteredHeroes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentHeroId = 1;
const apiKey = '973d08d93973bf81a87693a000b50abb';
const heroesPerLoad = 15; 

//aguarda o carregamento completo do documento HTML antes de executar certas funções
document.addEventListener('DOMContentLoaded', () => {
    fetchHeroes(currentHeroId, heroesPerLoad);
    displayFavorites(); //lista vazia de favoritos

    // Filtro de heróis
    document.getElementById('filter-input').addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        filteredHeroes = heroes.filter(hero => hero.name.toLowerCase().includes(searchTerm));
        displayHeroes(filteredHeroes); // Usa a lista filtrada
    });

    // Scroll Infinito
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            currentHeroId += heroesPerLoad;
            fetchHeroes(currentHeroId, heroesPerLoad);
        }
    });
});

// Função para buscar heróis da API SuperHero
async function fetchHeroes(startId, amount) {
    try {
        const promises = [];

        // Fazer múltiplas requisições para trazer vários heróis
        for (let i = startId; i < startId + amount; i++) {
            promises.push(fetch(`https://www.superheroapi.com/api.php/${apiKey}/${i}`).then(res => res.json()));
        }

        // Aguardar que todas as requisições sejam concluídas
        const newHeroes = await Promise.all(promises);

        // Filtrar heróis válidos (sem erro de resposta)
        const validHeroes = newHeroes.filter(hero => hero.response !== 'error');
        heroes = [...heroes, ...validHeroes];

        // Atualiza a exibição após carregar novos heróis
        displayHeroes(filteredHeroes.length > 0 ? filteredHeroes : heroes);
    } catch (error) {
        console.error('Erro ao buscar heróis:', error);
    }
}

// Exibir lista de heróis
function displayHeroes(heroesToDisplay) {
    const list = document.getElementById('heroes-list');
    list.innerHTML = '';

    // Usando map para criar elementos de heróis
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

        // Adicionando eventos para o mouse
        const imgContainer = item.querySelector('.hero-image-container');
        const img = imgContainer.querySelector('img');
        const hoverInfo = imgContainer.querySelector('.hero-hover-info');

        // Efeito de passar o mouse sobre a imagem
        img.addEventListener('mouseenter', () => {
            img.style.opacity = '0.7'; // Efeito de brilho
            hoverInfo.style.display = 'block'; // Mostrar informações
        });
        img.addEventListener('mouseleave', () => {
            img.style.opacity = '1'; // Retornar ao normal
            hoverInfo.style.display = 'none'; // Ocultar informações
        });

        item.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(hero));
        list.appendChild(item);
    });

    // Se não houver heróis após a filtragem, exibir uma mensagem
    if (heroesToDisplay.length === 0) {
        list.innerHTML = '<p>Nenhum herói encontrado.</p>';
    }
}

// Manipulação de Favoritos
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

// Verifica se o herói é favorito
function isFavorite(hero) {
    return favorites.some(fav => fav.id === hero.id);
}

// Exibir lista de favoritos
function displayFavorites() {
    const list = document.getElementById('favorites-list');
    list.innerHTML = '';
    favorites.forEach(fav => {
        const item = document.createElement('li');
        item.textContent = fav.name;
        list.appendChild(item);
    });
}
