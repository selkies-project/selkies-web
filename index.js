/* selkies.io — interaction and animation layer.
   Everything here is progressive enhancement: the page reads fine with JS off. */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

    /* ------------------------------------------------------------ header */
    const header = $('#siteHeader');
    const progress = $('#scrollProgress');
    function onScroll() {
        const y = window.scrollY || document.documentElement.scrollTop;
        header.classList.toggle('scrolled', y > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const navToggle = $('#navToggle');
    const navLinks = $('#navLinks');
    navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') { navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    });

    $('#year').textContent = String(new Date().getFullYear());

    /* ---------------------------------------------------- split headline */
    $$('[data-split]').forEach((el) => {
        let i = 0;
        const walk = (node) => {
            Array.from(node.childNodes).forEach((child) => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                        const w = document.createElement('span');
                        w.className = 'w'; w.textContent = part; w.style.setProperty('--i', i++);
                        frag.appendChild(w);
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === 1) {
                    // Keep styled inline elements (the gradient <em>) whole: a
                    // transformed child span would break their background-clip text.
                    const w = document.createElement('span');
                    w.className = 'w'; w.style.setProperty('--i', i++);
                    node.replaceChild(w, child); w.appendChild(child);
                }
            });
        };
        walk(el);
    });

    /* ------------------------------------------------------------ reveal */
    const revealIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add('in');
                if (en.target.matches('.gpu-card, .split-visual')) en.target.classList.add('in-view');
                revealIO.unobserve(en.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => revealIO.observe(el));

    /* ---------------------------------------------------------- counters */
    const countIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target, target = parseFloat(el.dataset.count);
            countIO.unobserve(el);
            if (reduceMotion.matches || target === 0) { el.textContent = String(target); return; }
            const t0 = performance.now(), dur = 1400;
            (function step(now) {
                const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
                el.textContent = String(Math.round(target * e));
                if (p < 1) requestAnimationFrame(step);
            })(t0);
        });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach((el) => countIO.observe(el));

    /* -------------------------------------------------------------- tilt */
    if (finePointer.matches && !reduceMotion.matches) {
        $$('.tilt').forEach((card) => {
            const max = parseFloat(card.dataset.tiltMax || '8');
            let raf = null, rx = 0, ry = 0, trx = 0, try_ = 0;
            const render = () => {
                rx += (trx - rx) * 0.15; ry += (try_ - ry) * 0.15;
                card.style.transform = 'perspective(1200px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
                raf = (Math.abs(trx - rx) + Math.abs(try_ - ry) > 0.02) ? requestAnimationFrame(render) : null;
            };
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
                trx = -py * max * 2; try_ = px * max * 2;
                if (!raf) raf = requestAnimationFrame(render);
            });
            card.addEventListener('pointerleave', () => { trx = 0; try_ = 0; if (!raf) raf = requestAnimationFrame(render); });
        });

        $$('.spotlight').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });

        $$('.magnetic').forEach((btn) => {
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
                btn.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
            });
            btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
        });
    }

    /* -------------------------------------------------------------- copy */
    $$('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const code = $('code', btn.parentElement);
            try { await navigator.clipboard.writeText(code.textContent.trim()); } catch (e) {
                const range = document.createRange(); range.selectNodeContents(code);
                const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
                try { document.execCommand('copy'); } catch (_) {}
                sel.removeAllRanges();
            }
            btn.textContent = 'Copied'; btn.classList.add('done');
            setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600);
        });
    });

    /* -------------------------------------------------------------- tabs */
    const tabs = $('#startTabs');
    if (tabs) {
        const buttons = $$('[role="tab"]', tabs), panels = $$('[role="tabpanel"]', tabs), ind = $('.tab-indicator', tabs);
        const moveInd = (btn) => { ind.style.width = btn.offsetWidth + 'px'; ind.style.transform = 'translateX(' + (btn.offsetLeft - 8) + 'px)'; };
        const select = (btn) => {
            buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
            panels.forEach((p) => { p.hidden = p.dataset.panel !== btn.dataset.tab; });
            moveInd(btn);
        };
        buttons.forEach((b) => b.addEventListener('click', () => select(b)));
        tabs.addEventListener('keydown', (e) => {
            const i = buttons.findIndex((b) => b.getAttribute('aria-selected') === 'true');
            if (e.key === 'ArrowRight') { const n = buttons[(i + 1) % buttons.length]; n.focus(); select(n); }
            if (e.key === 'ArrowLeft') { const n = buttons[(i - 1 + buttons.length) % buttons.length]; n.focus(); select(n); }
        });
        window.addEventListener('resize', () => moveInd(buttons.find((b) => b.getAttribute('aria-selected') === 'true')));
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveInd(buttons[0]));
        moveInd(buttons[0]);
    }

    /* ------------------------------------------------------- app marquee */
    const track = $('#appTrack');
    if (track && typeof apps !== 'undefined') {
        const baseImgUrl = 'https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/';
        const makeCard = (app) => {
            const a = document.createElement('a');
            a.className = 'app-card'; a.href = app.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
            const img = document.createElement('img');
            img.src = app.img.startsWith('http') ? app.img : baseImgUrl + app.img;
            img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
            const span = document.createElement('span'); span.textContent = app.name;
            a.append(img, span); return a;
        };
        const t1 = document.createElement('div'), t2 = document.createElement('div');
        t1.className = t2.className = 'sliding-track'; t2.setAttribute('aria-hidden', 'true');
        apps.forEach((app) => { t1.appendChild(makeCard(app)); t2.appendChild(makeCard(app)); });
        track.append(t1, t2);

        const LAP = 70, RESUME = 1500;
        let pos = 0, last = null, frame = null, onScreen = false, holdUntil = 0, down = false;
        const period = () => t2.offsetLeft - t1.offsetLeft;
        const step = (now) => {
            frame = null;
            if (!onScreen) { last = null; return; }
            if (last !== null && !down && now >= holdUntil) {
                const dt = Math.min(now - last, 100) / 1000, lap = period();
                if (lap > 0) {
                    pos += (lap / (reduceMotion.matches ? LAP * 3 : LAP)) * dt;
                    if (pos >= lap) pos -= lap;
                    track.scrollLeft = pos;
                }
            }
            last = now; frame = requestAnimationFrame(step);
        };
        const schedule = () => { if (frame === null && onScreen) frame = requestAnimationFrame(step); };
        const hold = (ms) => { holdUntil = Math.max(holdUntil, performance.now() + ms); };
        track.addEventListener('scroll', () => {
            const actual = track.scrollLeft;
            if (Math.abs(actual - pos) > 1) { const lap = period(); pos = lap > 0 ? actual % lap : actual; hold(RESUME); }
        }, { passive: true });
        track.addEventListener('pointerdown', () => { down = true; });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => track.addEventListener(ev, () => { down = false; hold(RESUME); }));
        new IntersectionObserver((en) => { onScreen = en[0].isIntersecting; schedule(); }).observe(track);
        document.addEventListener('visibilitychange', () => { if (document.hidden) last = null; else schedule(); });
    }

    /* --------------------------------------------------------- clip pausing */
    // The clips autoplay natively; this only pauses one while it is scrolled off
    // screen and resumes it when it comes back, so three loops never run at once.
    $$('video[autoplay]').forEach((video) => {
        new IntersectionObserver((en) => {
            if (en[0].isIntersecting) video.play().catch(() => {});
            else video.pause();
        }, { rootMargin: '100px 0px', threshold: 0.05 }).observe(video);
    });
})();

/* Legacy inline hook kept for any copied markup that still calls it. */
function copyCode(btn) { btn.click(); }
