
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

        // Função para carregar um livro
        async function loadBook(testament, bookKey) {
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
                    chapters: []
                };
                
                // Carregar capítulos (testando até 150 capítulos)
                for (let chapterNum = 1; chapterNum <= 150; chapterNum++) {
                    try {
                        const chapterPath = `${bookPath}${chapterNum}.json`;
                        const response = await fetch(chapterPath);
                        
                        if (response.ok) {
                            const chapterData = await response.json();
                            book.chapters[chapterNum - 1] = chapterData;
                        } else {
                            break;
                        }
                    } catch (error) {
                        break;
                    }
                }
                
                if (book.chapters.length > 0) {
                    bibleData[testament][bookKey] = book;
                    loadedBooks.add(bookId);
                    
                    if (bookCard) {
                        bookCard.classList.remove('loading');
                    }
                    
                    return book;
                } else {
                    throw new Error('Nenhum capítulo encontrado');
                }
                
            } catch (error) {
                console.error(`Erro ao carregar livro ${bookKey}:`, error);
                
                if (bookCard) {
                    bookCard.classList.remove('loading');
                    bookCard.style.opacity = '0.5';
                }
                
                throw error;
            }
        }

        function formatBookName(bookName) {
            return bookName
                .replace(/([0-9]+)([a-z])/g, '$1 $2')
                .replace(/\b\w/g, l => l.toUpperCase());
        }

        // Event listeners
        document.getElementById('bookSearch').addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            const bookCards = document.querySelectorAll('.book-card');
            
            bookCards.forEach(card => {
                const bookName = card.textContent.toLowerCase();
                card.style.display = bookName.includes(searchTerm) ? 'block' : 'none';
            });
        });

        document.querySelectorAll('.testament-btn').forEach(btn => {
            btn.addEventListener('click', function() {
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
                await loadBook(currentTestament, bookKey);
                
                currentBook = bookKey;
                currentChapter = null;
                
                updateChapterSelector();
                document.getElementById('chapterSection').style.display = 'block';
                
                if (bibleData[currentTestament][currentBook].chapters.length > 0) {
                    selectChapter(1);
                }
                
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
            
            book.chapters.forEach((chapter, index) => {
                if (chapter && chapter.length > 0) {
                    const chapterBtn = document.createElement('button');
                    chapterBtn.className = 'chapter-btn';
                    chapterBtn.textContent = index + 1;
                    chapterBtn.addEventListener('click', () => selectChapter(index + 1));
                    selector.appendChild(chapterBtn);
                }
            });
        }

        function selectChapter(chapterNumber) {
            currentChapter = chapterNumber;
            
            document.querySelectorAll('.chapter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.textContent) === chapterNumber) {
                    btn.classList.add('active');
                }
            });

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
                const totalChapters = book.chapters.filter(chapter => chapter && chapter.length > 0).length;
                
                prevBtn.disabled = currentChapter <= 1;
                nextBtn.disabled = currentChapter >= totalChapters;
            } else {
                controls.style.display = 'none';
            }
        }

        function navigateToPrevChapter() {
            if (currentChapter > 1) {
                selectChapter(currentChapter - 1);
            }
        }

        function navigateToNextChapter() {
            const book = bibleData[currentTestament][currentBook];
            const totalChapters = book.chapters.filter(chapter => chapter && chapter.length > 0).length;
            if (currentChapter < totalChapters) {
                selectChapter(currentChapter + 1);
            }
        }

        // Atalhos de teclado
        document.addEventListener('keydown', function(event) {
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
        window.addEventListener('load', function() {
            updateBooksGrid();
            updateContent();
        });