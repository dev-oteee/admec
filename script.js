// Configuração dos caminhos
const BIBLE_PATH = './biblia/';
const OLD_TESTAMENT_PATH = 'old-testament/';
const NEW_TESTAMENT_PATH = 'new-testament/';

// Estrutura de dados
let bibleData = { old: {}, new: {} };
let loadedBooks = new Set();
let currentTestament = 'old';
let currentBook = null;
let currentChapter = null;

// Metadados com número de capítulos por livro (otimização)
const bookMetadata = {
    old: {
        'genesis': 50, 'exodo': 40, 'levitico': 27, 'numeros': 36, 'deuteronomio': 34,
        'josue': 24, 'juizes': 21, 'rute': 4, '1samuel': 31, '2samuel': 24,
        '1reis': 22, '2reis': 25, '1cronicas': 29, '2cronicas': 36, 'esdras': 10,
        'neemias': 13, 'ester': 10, 'jo': 42, 'salmos': 150, 'proverbios': 31,
        'eclesiastes': 12, 'cantares': 8, 'isaias': 66, 'jeremias': 52, 'lamentacoes': 5,
        'ezequiel': 48, 'daniel': 12, 'oseias': 14, 'joel': 3, 'amos': 9,
        'obadias': 1, 'jonas': 4, 'miqueias': 7, 'naum': 3, 'habacuque': 3,
        'sofonias': 3, 'ageu': 2, 'zacarias': 14, 'malaquias': 4
    },
    new: {
        'mateus': 28, 'marcos': 16, 'lucas': 24, 'joao': 21, 'atos': 28,
        'romanos': 16, '1corintios': 16, '2corintios': 13, 'galatas': 6, 'efesios': 6,
        'filipenses': 4, 'colossenses': 4, '1tessalonicenses': 5, '2tessalonicenses': 3,
        '1timoteo': 6, '2timoteo': 4, 'tito': 3, 'filemom': 1, 'hebreus': 13,
        'tiago': 5, '1pedro': 5, '2pedro': 3, '1joao': 5, '2joao': 1,
        '3joao': 1, 'judas': 1, 'apocalipse': 22
    }
};

// Lista dos livros da Bíblia
const bookNames = {
    old: {
        'genesis': 'Gênesis',
        'exodo': 'Êxodo',
        'levitico': 'Levítico',
        'numeros': 'Números',
        'deuteronomio': 'Deuteronômio',
        'josue': 'Josué',
        'juizes': 'Juízes',
        'rute': 'Rute',
        '1samuel': '1 Samuel',
        '2samuel': '2 Samuel',
        '1reis': '1 Reis',
        '2reis': '2 Reis',
        '1cronicas': '1 Crônicas',
        '2cronicas': '2 Crônicas',
        'esdras': 'Esdras',
        'neemias': 'Neemias',
        'ester': 'Ester',
        'jo': 'Jó',
        'salmos': 'Salmos',
        'proverbios': 'Provérbios',
        'eclesiastes': 'Eclesiastes',
        'cantares': 'Cantares',
        'isaias': 'Isaías',
        'jeremias': 'Jeremias',
        'lamentacoes': 'Lamentações',
        'ezequiel': 'Ezequiel',
        'daniel': 'Daniel',
        'oseias': 'Oséias',
        'joel': 'Joel',
        'amos': 'Amós',
        'obadias': 'Obadias',
        'jonas': 'Jonas',
        'miqueias': 'Miquéias',
        'naum': 'Naum',
        'habacuque': 'Habacuque',
        'sofonias': 'Sofonias',
        'ageu': 'Ageu',
        'zacarias': 'Zacarias',
        'malaquias': 'Malaquias'
    },
    new: {
        'mateus': 'Mateus',
        'marcos': 'Marcos',
        'lucas': 'Lucas',
        'joao': 'João',
        'atos': 'Atos',
        'romanos': 'Romanos',
        '1corintios': '1 Coríntios',
        '2corintios': '2 Coríntios',
        'galatas': 'Gálatas',
        'efesios': 'Efésios',
        'filipenses': 'Filipenses',
        'colossenses': 'Colossenses',
        '1tessalonicenses': '1 Tessalonicenses',
        '2tessalonicenses': '2 Tessalonicenses',
        '1timoteo': '1 Timóteo',
        '2timoteo': '2 Timóteo',
        'tito': 'Tito',
        'filemom': 'Filemom',
        'hebreus': 'Hebreus',
        'tiago': 'Tiago',
        '1pedro': '1 Pedro',
        '2pedro': '2 Pedro',
        '1joao': '1 João',
        '2joao': '2 João',
        '3joao': '3 João',
        'judas': 'Judas',
        'apocalipse': 'Apocalipse'
    }
};

// Cache para capítulos carregados individualmente
let chapterCache = new Map();

// --- Helper: rolagem suave considerando header fixo ---
function smoothScrollToElement(el, extraOffset = 8) {
    if (!el) return;
    const header = document.querySelector('.conteudo');
    const headerHeight = header ? header.offsetHeight : 0;
    const rect = el.getBoundingClientRect();
    const absoluteY = window.scrollY + rect.top - headerHeight - extraOffset;
    window.scrollTo({ top: absoluteY, behavior: 'smooth' });
}

// Função otimizada para carregar apenas o primeiro capítulo
async function loadBookInitial(testament, bookKey) {
    const bookId = `${testament}-${bookKey}`;
    if (loadedBooks.has(bookId)) {
        return bibleData[testament][bookKey];
    }

    const bookCard = document.querySelector(`[data-book="${bookKey}"]`);
    if (bookCard) {
        bookCard.classList.add('loading');
    }

    try {
        const testamentPath = testament === 'old' ? OLD_TESTAMENT_PATH : NEW_TESTAMENT_PATH;
        const bookPath = `${BIBLE_PATH}${testamentPath}${bookKey}/`;

        const book = {
            name: bookNames[testament][bookKey] || formatBookName(bookKey),
            chapters: [],
            totalChapters: bookMetadata[testament][bookKey] || 1
        };

        // Carregar apenas o primeiro capítulo inicialmente
        try {
            const chapterPath = `${bookPath}1.json`;
            const response = await fetch(chapterPath);

            if (response.ok) {
                const chapterData = await response.json();
                book.chapters[0] = chapterData;

                // Cachear o primeiro capítulo
                const chapterKey = `${bookId}-1`;
                chapterCache.set(chapterKey, chapterData);
            } else {
                throw new Error('Primeiro capítulo não encontrado');
            }
        } catch (error) {
            throw new Error('Erro ao carregar primeiro capítulo');
        }

        bibleData[testament][bookKey] = book;
        loadedBooks.add(bookId);

        if (bookCard) {
            bookCard.classList.remove('loading');
        }

        return book;

    } catch (error) {
        console.error(`Erro ao carregar livro ${bookKey}:`, error);

        if (bookCard) {
            bookCard.classList.remove('loading');
            bookCard.style.opacity = '0.5';
        }

        throw error;
    }
}

// Função para carregar um capítulo específico sob demanda
async function loadChapter(testament, bookKey, chapterNumber) {
    const bookId = `${testament}-${bookKey}`;
    const chapterKey = `${bookId}-${chapterNumber}`;

    // Verificar cache primeiro
    if (chapterCache.has(chapterKey)) {
        return chapterCache.get(chapterKey);
    }

    try {
        const testamentPath = testament === 'old' ? OLD_TESTAMENT_PATH : NEW_TESTAMENT_PATH;
        const bookPath = `${BIBLE_PATH}${testamentPath}${bookKey}/`;
        const chapterPath = `${bookPath}${chapterNumber}.json`;

        const response = await fetch(chapterPath);

        if (response.ok) {
            const chapterData = await response.json();

            // Cachear o capítulo
            chapterCache.set(chapterKey, chapterData);

            // Adicionar ao array de capítulos do livro
            if (bibleData[testament][bookKey]) {
                bibleData[testament][bookKey].chapters[chapterNumber - 1] = chapterData;
            }

            return chapterData;
        } else {
            throw new Error(`Capítulo ${chapterNumber} não encontrado`);
        }
    } catch (error) {
        console.error(`Erro ao carregar capítulo ${chapterNumber} do livro ${bookKey}:`, error);
        throw error;
    }
}

// Função para pré-carregar capítulos próximos (otimização adicional)
async function preloadNearbyChapters(testament, bookKey, currentChapterNumber) {
    const book = bibleData[testament][bookKey];
    if (!book) return;

    const totalChapters = book.totalChapters;
    const chaptersToPreload = [];

    // Pré-carregar capítulo anterior e próximo
    if (currentChapterNumber > 1) {
        chaptersToPreload.push(currentChapterNumber - 1);
    }
    if (currentChapterNumber < totalChapters) {
        chaptersToPreload.push(currentChapterNumber + 1);
    }

    // Carregar em paralelo sem aguardar
    chaptersToPreload.forEach(chapterNum => {
        loadChapter(testament, bookKey, chapterNum).catch(() => {
            // Ignorar erros no pré-carregamento
        });
    });
}

function formatBookName(bookName) {
    return bookName
        .replace(/([0-9]+)([a-z])/g, '$1 $2')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Event listeners
document.getElementById('bookSearch').addEventListener('input', function (event) {
    const searchTerm = event.target.value.toLowerCase();
    const bookCards = document.querySelectorAll('.book-card');

    bookCards.forEach(card => {
        const bookName = card.textContent.toLowerCase();
        card.style.display = bookName.includes(searchTerm) ? 'block' : 'none';
    });
});

// Testamento buttons (listeners permanecem os mesmos que você tinha)
document.querySelectorAll('.testament-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        selectTestament(this.dataset.testament);
    });
});

document.getElementById('prevChapter').addEventListener('click', navigateToPrevChapter);
document.getElementById('nextChapter').addEventListener('click', navigateToNextChapter);

function selectTestament(testament) {
    currentTestament = testament;

    document.querySelectorAll('.testament-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-testament="${testament}"]`).classList.add('active');

    currentBook = null;
    currentChapter = null;
    document.getElementById('chapterSection').style.display = 'none';
    document.getElementById('navigationControls').style.display = 'none';

    updateBooksGrid();
    updateContent();

    // Rolagem suave até a grade de livros (com ajuste para header fixo)
    const booksGridEl = document.getElementById('booksGrid');
    if (booksGridEl) {
        // pequeno delay para garantir que a grade foi renderizada
        setTimeout(() => smoothScrollToElement(booksGridEl), 80);
    }
}

function updateBooksGrid() {
    const grid = document.getElementById('booksGrid');
    const books = bookNames[currentTestament];

    grid.innerHTML = '';

    Object.keys(books).forEach(bookKey => {
        const bookCard = document.createElement('button');
        bookCard.className = 'book-card';
        bookCard.textContent = books[bookKey];
        bookCard.dataset.book = bookKey;
        bookCard.addEventListener('click', () => selectBook(bookKey));
        grid.appendChild(bookCard);
    });
}

async function selectBook(bookKey) {
    document.querySelectorAll('.book-card').forEach(card => {
        card.classList.remove('selected');
    });

    const bookCard = document.querySelector(`[data-book="${bookKey}"]`);
    if (bookCard) {
        bookCard.classList.add('selected');
    }

    try {
        // Usar a função otimizada que carrega apenas o primeiro capítulo
        await loadBookInitial(currentTestament, bookKey);

        currentBook = bookKey;
        currentChapter = null;

        updateChapterSelector();
        const chapterSectionEl = document.getElementById('chapterSection');
        chapterSectionEl.style.display = 'block';

        // Rolagem suave até a seção de capítulos (ajustada para header fixo)
        setTimeout(() => smoothScrollToElement(chapterSectionEl), 80);

        // Selecionar o primeiro capítulo
        selectChapter(1);

    } catch (error) {
        const content = document.getElementById('content');
        content.innerHTML = `
                    <div class="error">
                        <h3>❌ Erro ao carregar o livro</h3>
                        <p>Não foi possível carregar o livro ${bookNames[currentTestament][bookKey]}. Verifique se os arquivos estão no local correto.</p>
                        <p><strong>Caminho esperado:</strong> ${BIBLE_PATH}${currentTestament === 'old' ? OLD_TESTAMENT_PATH : NEW_TESTAMENT_PATH}${bookKey}/1.json</p>
                    </div>
                `;
    }
}

function updateChapterSelector() {
    const selector = document.getElementById('chapterSelector');
    const book = bibleData[currentTestament][currentBook];

    selector.innerHTML = '';

    // Usar os metadados para criar botões para todos os capítulos
    for (let i = 1; i <= book.totalChapters; i++) {
        const chapterBtn = document.createElement('button');
        chapterBtn.className = 'chapter-btn';
        chapterBtn.textContent = i;
        chapterBtn.addEventListener('click', () => selectChapter(i));
        selector.appendChild(chapterBtn);
    }
}

async function selectChapter(chapterNumber) {
    currentChapter = chapterNumber;

    // Atualizar botões ativos
    document.querySelectorAll('.chapter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === chapterNumber) {
            btn.classList.add('active');
        }
    });

    // Mostrar loading se necessário
    const content = document.getElementById('content');
    const book = bibleData[currentTestament][currentBook];

    if (!book.chapters[chapterNumber - 1]) {
        content.innerHTML = `
                    <div class="loading">
                        <h3>Carregando capítulo ${chapterNumber}...</h3>
                    </div>
                `;

        try {
            // Carregar o capítulo sob demanda
            await loadChapter(currentTestament, currentBook, chapterNumber);

            // Pré-carregar capítulos próximos em background
            preloadNearbyChapters(currentTestament, currentBook, chapterNumber);

        } catch (error) {
            content.innerHTML = `
                        <div class="error">
                            <h3>❌ Erro ao carregar capítulo</h3>
                            <p>Não foi possível carregar o capítulo ${chapterNumber}.</p>
                        </div>
                    `;
            return;
        }
    }

    updateContent();
    updateNavigationControls();
}

function updateContent() {
    const content = document.getElementById('content');

    if (!currentBook || !currentChapter) {
        content.innerHTML = `
                    <div class="loading">
                        <h3>Selecione um livro, em seguida o capítulo</h3>
                        <p>Escolha um livro na lista acima para começar a leitura das Escrituras.</p>
                    </div>
                `;
        return;
    }

    const book = bibleData[currentTestament][currentBook];
    const chapter = book.chapters[currentChapter - 1];

    if (!chapter || chapter.length === 0) {
        content.innerHTML = '<div class="error"><h3>❌ Capítulo não encontrado</h3></div>';
        return;
    }

    let html = `<h2>${book.name} - Capítulo ${currentChapter}</h2>`;

    let currentTitle = '';
    chapter.forEach(verse => {
        if (verse.title && verse.title !== currentTitle) {
            currentTitle = verse.title;
            html += `<h3>${currentTitle}</h3>`;
        }

        html += `<div class="verse">
                    <span class="verse-number">${verse.number}</span>
                    ${verse.content}
                </div>`;
    });

    content.innerHTML = html;
}

function updateNavigationControls() {
    const controls = document.getElementById('navigationControls');
    const prevBtn = document.getElementById('prevChapter');
    const nextBtn = document.getElementById('nextChapter');

    if (currentBook && currentChapter) {
        controls.style.display = 'flex';

        const book = bibleData[currentTestament][currentBook];
        const totalChapters = book.totalChapters;

        prevBtn.disabled = currentChapter <= 1;
        nextBtn.disabled = currentChapter >= totalChapters;
    } else {
        controls.style.display = 'none';
    }
}

async function navigateToPrevChapter() {
    if (currentChapter > 1) {
        await selectChapter(currentChapter - 1);
    }
}

async function navigateToNextChapter() {
    const book = bibleData[currentTestament][currentBook];
    const totalChapters = book.totalChapters;
    if (currentChapter < totalChapters) {
        await selectChapter(currentChapter + 1);
    }
}

// Atalhos de teclado
document.addEventListener('keydown', function (event) {
    if (currentBook && currentChapter) {
        if (event.key === 'ArrowLeft' && event.ctrlKey) {
            event.preventDefault();
            navigateToPrevChapter();
        } else if (event.key === 'ArrowRight' && event.ctrlKey) {
            event.preventDefault();
            navigateToNextChapter();
        }
    }
});


// Inicializar
window.addEventListener('load', function () {
    updateBooksGrid();
    updateContent();
});

let emLeitura = false;





 let ultimaPosicaoScroll = 0;

  window.addEventListener('scroll', function () {
    let posicaoAtual = window.scrollY;
    const menu = document.querySelector('.conteudo');

    if (posicaoAtual > ultimaPosicaoScroll) {
      // Rolando pra baixo → esconde o menu
      menu.classList.add('oculto');
    } else {
      // Rolando pra cima → mostra o menu
      menu.classList.remove('oculto');
    }

    ultimaPosicaoScroll = posicaoAtual;
  });

document.addEventListener('DOMContentLoaded', () => {
    const testamentButtons = document.querySelectorAll('.testament-btn');
    const booksGrid = document.getElementById('booksGrid');
    const chapterSection = document.getElementById('chapterSection');

    function smoothScrollToElement(element) {
        const extraOffset = 80; // Ajuste para seu header fixo
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - extraOffset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    testamentButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                smoothScrollToElement(booksGrid);
            }, 300); // atraso para renderização
        });
    });

    document.addEventListener('click', e => {
        if (e.target.classList.contains('book-btn')) {
            setTimeout(() => {
                smoothScrollToElement(chapterSection);
            }, 300); // atraso para renderização
        }
    });
});
