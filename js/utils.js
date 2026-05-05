// ===== Hello Kitty SMP — Shared Utilities =====

(function() {
    // ---- Theme toggle ----
    function applyTheme(isGold) {
        document.body.classList.toggle('gold-theme', isGold);
        const toggle = document.getElementById('themeToggle');
        if (toggle) toggle.checked = isGold;
    }

    const savedTheme = localStorage.getItem('hksmp-theme');
    if (savedTheme === 'gold') applyTheme(true);

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            if (localStorage.getItem('hksmp-theme') === 'gold') toggle.checked = true;
            toggle.addEventListener('change', () => {
                const isGold = toggle.checked;
                applyTheme(isGold);
                localStorage.setItem('hksmp-theme', isGold ? 'gold' : 'pink');
            });
        }

        // ---- Scroll to top ----
        const stBtn = document.getElementById('scrollTop');
        if (stBtn) {
            window.addEventListener('scroll', () => {
                stBtn.classList.toggle('visible', window.scrollY > 400);
            });
            stBtn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
        }

        // ---- Navbar scroll ----
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('scrolled', window.scrollY > 40);
            });
        }

        // ---- Mobile menu ----
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (menuBtn && mobileMenu) {
            let open = false;
            menuBtn.addEventListener('click', () => {
                open = !open;
                mobileMenu.classList.toggle('open', open);
                menuBtn.textContent = open ? '✕' : '☰';
            });
            mobileMenu.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => {
                    open = false;
                    mobileMenu.classList.remove('open');
                    menuBtn.textContent = '☰';
                });
            });
            document.addEventListener('click', e => {
                if (open && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                    open = false;
                    mobileMenu.classList.remove('open');
                    menuBtn.textContent = '☰';
                }
            });
        }
    });
})();