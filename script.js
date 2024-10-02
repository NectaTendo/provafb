
let heróis = [];
let heróisFiltrados = [];
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
let idAtualHeroi = 1;
const chaveApi = '973d08d93973bf81a87693a000b50abb';
const heróisPorCarregamento = 15; 


document.addEventListener('DOMContentLoaded', () => {
    buscarHeróis(idAtualHeroi, heróisPorCarregamento);
    exibirFavoritos(); 

    
    document.getElementById('filter-input').addEventListener('input', function () {
        const termoBusca = this.value.toLowerCase();
        heróisFiltrados = heróis.filter(heroi => heroi.name.toLowerCase().includes(termoBusca));
        exibirHeróis(heróisFiltrados);
    });

    
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            idAtualHeroi += heróisPorCarregamento;
            buscarHeróis(idAtualHeroi, heróisPorCarregamento);
        }
    });
});


async function buscarHeróis(idInicial, quantidade) {
    try {
        const promessas = [];

        
        for (let i = idInicial; i < idInicial + quantidade; i++) {
            promessas.push(fetch(`https://www.superheroapi.com/api.php/${chaveApi}/${i}`).then(res => res.json()));
        }

       
        const novosHeróis = await Promise.all(promessas);

        
        const heróisVálidos = novosHeróis.filter(heroi => heroi.response !== 'error');
        heróis = [...heróis, ...heróisVálidos];

        
        exibirHeróis(heróisFiltrados.length > 0 ? heróisFiltrados : heróis);
    } catch (erro) {
        console.error('Erro ao buscar heróis:', erro);
    }
}


function exibirHeróis(heróisParaExibir) {
    const lista = document.getElementById('heroes-list');
    lista.innerHTML = '';

    
    heróisParaExibir.map(heroi => {
        const item = document.createElement('div');
        item.className = 'hero-item';
        item.innerHTML = `
            <div class="hero-image-container">
                <img src="${heroi.image.url}" alt="${heroi.name}" width="100">
                <div class="hero-hover-info" style="display:none;">
                    <p>Poder: ${heroi.powerstats.power || 'Desconhecido'}</p>
                </div>
            </div>
            <h3>${heroi.name}</h3>
            <button class="favorite-btn ${ehFavorito(heroi) ? 'active' : ''}">
                ${ehFavorito(heroi) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
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

        item.querySelector('.favorite-btn').addEventListener('click', () => alternarFavorito(heroi));
        lista.appendChild(item);
    });

    
    if (heróisParaExibir.length === 0) {
        lista.innerHTML = '<p>Nenhum herói encontrado.</p>';
    }
}


function alternarFavorito(heroi) {
    if (ehFavorito(heroi)) {
        favoritos = favoritos.filter(fav => fav.id !== heroi.id);
    } else {
        favoritos.push(heroi);
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    exibirFavoritos();
    exibirHeróis(heróisFiltrados.length ? heróisFiltrados : heróis);
}


function ehFavorito(heroi) {
    return favoritos.some(fav => fav.id === heroi.id);
}


function exibirFavoritos() {
    const lista = document.getElementById('favorites-list');
    lista.innerHTML = '';
    favoritos.forEach(fav => {
        const item = document.createElement('li');
        item.textContent = fav.name;
        lista.appendChild(item);
    });
}
