/* ==========================================================================
   The page's theme: light or dark as the reader picked it, else the system's.
   Loaded in <head>, ahead of the first paint, so a light page never flashes
   dark; it follows the system while the reader has picked nothing.
   ========================================================================== */
(() => {
    const KEY = 'theme';
    const COLORS = { light: '#f7f8fc', dark: '#07090f' };
    const system = window.matchMedia('(prefers-color-scheme: light)');

    // Storage can be off (a private window, blocked site data): the system's then.
    const chosen = () => {
        try {
            const value = localStorage.getItem(KEY);
            return value === 'light' || value === 'dark' ? value : 'system';
        } catch { return 'system'; }
    };

    const apply = (choice) => {
        const theme = choice === 'system' ? (system.matches ? 'light' : 'dark') : choice;
        document.documentElement.dataset.theme = theme;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = COLORS[theme];
        document.querySelectorAll('[data-theme-choice]').forEach((b) => {
            b.setAttribute('aria-pressed', String(b.dataset.themeChoice === choice));
        });
    };

    apply(chosen());
    system.addEventListener('change', () => { if (chosen() === 'system') apply('system'); });
    document.addEventListener('DOMContentLoaded', () => {
        apply(chosen());
        document.querySelectorAll('[data-theme-choice]').forEach((b) => b.addEventListener('click', () => {
            const choice = b.dataset.themeChoice;
            try {
                if (choice === 'system') localStorage.removeItem(KEY);
                else localStorage.setItem(KEY, choice);
            } catch { /* the choice still holds until the page is left */ }
            apply(choice);
        }));
    });
})();
