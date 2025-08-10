// Controle de item ativo no menu
const navLinks = document.querySelectorAll('.mobile-nav a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Mostrar/esconder barra no scroll
let lastScrollTop = 0;
const mobileNav = document.querySelector('.mobile-nav');

window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Rolando para baixo → esconder
        mobileNav.classList.add('hidden');
    } else {
        // Rolando para cima → mostrar
        mobileNav.classList.remove('hidden');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});
