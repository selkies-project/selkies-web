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

    /* ==================================================================
       Stream simulation.
       A fake desktop is rendered into the hero canvas. Every animated thing
       reports the rectangle it dirtied; only those damage regions are
       "encoded" (outlined), the rest of the frame is left alone. When
       nothing has moved for a while a paint-over pass sweeps the regions that
       were touched since the last one, and then the session goes idle: no
       frames at all.
       ================================================================== */
    const canvas = $('#streamSim');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d', { alpha: false });
        const W = canvas.width, H = canvas.height;
        const hudStripes = $('#hudStripes'), hudState = $('#hudState'), hudBar = $('#hudBar');

        const PINK = '213,73,154', VIOLET = '157,140,240';
        let dirty = [];                       // rects dirtied this frame
        let touched = [];                     // regions dirtied since last paint-over
        let quiet = 0;                        // frames with no damage
        let paint = null;                     // {t0} while a paint-over sweep runs
        let idle = false;
        let lastClockSec = -1;
        let running = false, raf = null, lastT = 0;

        const mark = (x, y, w, h) => dirty.push([x, y, w, h]);

        /* ---- scene state ---- */
        const cube = { x: 560, y: 60, w: 360, h: 270, ax: 0.4, ay: 0.7, spinning: false };
        const term = { x: 40, y: 250, w: 440, h: 270, lines: ['$ selkies --wayland=true --encoder=h264enc', 'pixelflux: NVENC session (High 4:4:4) 1920x1080@60', 'pcmflux: opus 48k stereo, silence gate on', 'ws: client connected, WebCodecs h264 ok'], shown: 4, typing: null };
        const doc = { x: 40, y: 40, w: 480, h: 190 };
        const cur = { x: 300, y: 320, tx: 300, ty: 320, path: null };
        const taskbarH = 36;

        const roundRect = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

        function drawWallpaper() {
            const g = ctx.createLinearGradient(0, 0, W, H);
            g.addColorStop(0, '#111a2c'); g.addColorStop(0.5, '#0d1322'); g.addColorStop(1, '#1a1330');
            ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
            const r = ctx.createRadialGradient(W * 0.75, H * 0.35, 20, W * 0.75, H * 0.35, 420);
            r.addColorStop(0, 'rgba(121,103,197,.25)'); r.addColorStop(1, 'rgba(121,103,197,0)');
            ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
            const r2 = ctx.createRadialGradient(W * 0.15, H * 0.9, 20, W * 0.15, H * 0.9, 380);
            r2.addColorStop(0, 'rgba(213,73,154,.18)'); r2.addColorStop(1, 'rgba(213,73,154,0)');
            ctx.fillStyle = r2; ctx.fillRect(0, 0, W, H);
        }
        function drawWindow(win, title) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
            roundRect(win.x, win.y, win.w, win.h, 10); ctx.fillStyle = '#0e131f'; ctx.fill();
            ctx.restore();
            roundRect(win.x, win.y, win.w, win.h, 10); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(win.x + 1, win.y + 1, win.w - 2, 28);
            ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(win.x + 16 + i * 16, win.y + 15, 5, 0, Math.PI * 2); ctx.fill(); });
            ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '500 12px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
            ctx.fillText(title, win.x + 66, win.y + 15);
        }
        function drawDoc() {
            drawWindow(doc, 'notes.md');
            ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '700 15px Sora, Inter, sans-serif'; ctx.textBaseline = 'alphabetic';
            ctx.fillText('Selkies is a hybrid streamer', doc.x + 20, doc.y + 58);
            ctx.fillStyle = 'rgba(255,255,255,.28)';
            const widths = [400, 360, 420, 300, 380, 250];
            widths.forEach((w, i) => { ctx.fillRect(doc.x + 20, doc.y + 78 + i * 17, w * (doc.w - 40) / 440, 7); });
        }
        function drawTerm() {
            drawWindow(term, 'bash');
            ctx.font = '12px "JetBrains Mono", ui-monospace, monospace'; ctx.textBaseline = 'alphabetic';
            for (let i = 0; i < term.shown; i++) {
                ctx.fillStyle = i === 0 ? '#5fe3a1' : 'rgba(215,224,240,.8)';
                ctx.fillText(term.lines[i], term.x + 16, term.y + 52 + i * 20);
            }
            if (term.typing) {
                const s = term.typing.text.slice(0, term.typing.n);
                ctx.fillStyle = '#5fe3a1'; ctx.fillText(s, term.x + 16, term.y + 52 + term.shown * 20);
                const cw = ctx.measureText(s).width;
                ctx.fillStyle = '#5fe3a1'; ctx.fillRect(term.x + 18 + cw, term.y + 40 + term.shown * 20, 7, 14);
            }
        }
        const verts = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        function drawCube() {
            drawWindow(cube, 'viewport — glmark2');
            const cx = cube.x + cube.w / 2, cy = cube.y + 30 + (cube.h - 30) / 2, s = 62;
            const ca = Math.cos(cube.ax), sa = Math.sin(cube.ax), cb = Math.cos(cube.ay), sb = Math.sin(cube.ay);
            const P = verts.map(([x, y, z]) => {
                let y1 = y * ca - z * sa, z1 = y * sa + z * ca;
                let x2 = x * cb + z1 * sb, z2 = -x * sb + z1 * cb;
                const d = 3.6 / (3.6 + z2);
                return [cx + x2 * s * d, cy + y1 * s * d, z2];
            });
            // grid floor
            ctx.strokeStyle = 'rgba(157,140,240,.12)'; ctx.lineWidth = 1;
            for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(cube.x + 20 + i * (cube.w - 40) / 8, cube.y + cube.h - 20); ctx.lineTo(cx + (i - 4) * 18, cube.y + cube.h - 90); ctx.stroke(); }
            ctx.lineWidth = 2; ctx.lineJoin = 'round';
            edges.forEach(([a, b]) => {
                const g = ctx.createLinearGradient(P[a][0], P[a][1], P[b][0], P[b][1]);
                g.addColorStop(0, 'rgba(213,73,154,.95)'); g.addColorStop(1, 'rgba(121,103,197,.95)');
                ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke();
            });
            ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
            ctx.textAlign = 'right'; ctx.fillText(cube.spinning ? '60 fps' : 'idle', cube.x + cube.w - 14, cube.y + 48); ctx.textAlign = 'left';
        }
        function drawTaskbar(now) {
            ctx.fillStyle = 'rgba(8,11,18,.92)'; ctx.fillRect(0, H - taskbarH, W, taskbarH);
            ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, H - taskbarH, W, 1);
            for (let i = 0; i < 5; i++) { ctx.fillStyle = i === 0 ? 'rgba(213,73,154,.9)' : 'rgba(255,255,255,.18)'; roundRect(14 + i * 34, H - taskbarH + 8, 20, 20, 5); ctx.fill(); }
            const d = new Date(now);
            const t = d.toTimeString().slice(0, 8);
            ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '500 12px "JetBrains Mono", ui-monospace, monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
            ctx.fillText(t, W - 16, H - taskbarH / 2); ctx.textAlign = 'left';
            if (d.getSeconds() !== lastClockSec) { lastClockSec = d.getSeconds(); mark(W - 90, H - taskbarH, 90, taskbarH); }
        }
        function drawCursor() {
            ctx.save(); ctx.translate(cur.x, cur.y);
            ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 17); ctx.lineTo(4.5, 13); ctx.lineTo(7.5, 19.5); ctx.lineTo(10.5, 18); ctx.lineTo(7.5, 12); ctx.lineTo(13, 12); ctx.closePath();
            ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();
        }

        function drawOverlay(regions, paintProgress) {
            // encoded damage regions
            ctx.lineWidth = 2;
            regions.forEach(([x, y, w, h]) => {
                ctx.fillStyle = 'rgba(' + PINK + ',.14)'; ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = 'rgba(' + PINK + ',.9)'; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
                ctx.fillStyle = 'rgba(' + PINK + ',.9)'; ctx.fillRect(x, y, 14, 2); ctx.fillRect(x, y, 2, 14);
                ctx.fillRect(x + w - 14, y + h - 2, 14, 2); ctx.fillRect(x + w - 2, y + h - 14, 2, 14);
            });
            if (paintProgress !== null) {
                const sweepY = paintProgress * H;
                touched.forEach(([x, y, w, h]) => {
                    const visible = Math.min(h, Math.max(0, sweepY - y));
                    if (visible <= 0) return;
                    ctx.fillStyle = 'rgba(' + VIOLET + ',.16)'; ctx.fillRect(x, y, w, visible);
                    ctx.strokeStyle = 'rgba(' + VIOLET + ',.9)'; ctx.strokeRect(x + 1, y + 1, w - 2, Math.max(1, visible - 2));
                });
                const g = ctx.createLinearGradient(0, sweepY - 40, 0, sweepY + 6);
                g.addColorStop(0, 'rgba(' + VIOLET + ',0)'); g.addColorStop(1, 'rgba(' + VIOLET + ',.5)');
                ctx.fillStyle = g; ctx.fillRect(0, sweepY - 40, W, 46);
            }
            if (idle) {
                ctx.fillStyle = 'rgba(95,227,161,.12)'; roundRect(W / 2 - 70, 14, 140, 26, 13); ctx.fill();
                ctx.strokeStyle = 'rgba(95,227,161,.4)'; ctx.stroke();
                ctx.fillStyle = '#5fe3a1'; ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('idle · 0 frames · 0 B/s', W / 2, 27); ctx.textAlign = 'left';
            }
        }

        /* ---- choreography ---- */
        const script = [
            { t: 0, do: () => { cube.spinning = true; cursorTo(700, 190); } },
            { t: 2600, do: () => { cursorTo(760, 250); } },
            { t: 4200, do: () => { cube.spinning = false; } },
            { t: 8200, do: () => { cursorTo(260, 470); } },
            { t: 9200, do: () => { typeLine('$ pixelflux: paint-over idr sent (crf 18)'); } },
            { t: 13800, do: () => { cursorTo(640, 160); } },
            { t: 15400, do: () => { cube.spinning = true; } },
            { t: 17200, do: () => { cube.spinning = false; } },
            { t: 21500, do: () => { typeLine('$ ws: client idle, capture paused'); } },
        ];
        const LOOP = 26500;
        let scriptStart = 0, scriptIdx = 0;

        function cursorTo(x, y) { cur.path = { x0: cur.x, y0: cur.y, x1: x, y1: y, t0: performance.now(), d: 900 + Math.hypot(x - cur.x, y - cur.y) * 0.8 }; }
        function typeLine(text) {
            if (term.shown >= 9) { term.lines.splice(1, term.shown - 3); term.shown = term.lines.length; }
            term.typing = { text, n: 0, last: performance.now() };
        }

        function update(now, dt) {
            if (!scriptStart) scriptStart = now;
            let el = now - scriptStart;
            if (el >= LOOP) { scriptStart = now; el = 0; scriptIdx = 0; }
            while (scriptIdx < script.length && script[scriptIdx].t <= el) { script[scriptIdx].do(); scriptIdx++; }

            if (cube.spinning) { cube.ax += dt * 0.9; cube.ay += dt * 1.3; mark(cube.x, cube.y + 30, cube.w, cube.h - 30); }
            if (cur.path) {
                const p = Math.min(1, (now - cur.path.t0) / cur.path.d), e = 1 - Math.pow(1 - p, 3);
                const nx = cur.path.x0 + (cur.path.x1 - cur.path.x0) * e, ny = cur.path.y0 + (cur.path.y1 - cur.path.y0) * e;
                mark(Math.min(cur.x, nx) - 2, Math.min(cur.y, ny) - 2, Math.abs(nx - cur.x) + 18, Math.abs(ny - cur.y) + 24);
                cur.x = nx; cur.y = ny;
                if (p >= 1) cur.path = null;
            }
            if (term.typing) {
                if (now - term.typing.last > 38) {
                    term.typing.n++; term.typing.last = now;
                    mark(term.x, term.y + 38 + term.shown * 20, term.w, 22);
                    if (term.typing.n >= term.typing.text.length) { term.lines.push(term.typing.text); term.shown++; term.typing = null; }
                }
            }
        }

        function frame(now) {
            raf = null;
            if (!running) return;
            const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0.016; lastT = now;
            dirty = [];
            update(now, dt);

            drawWallpaper(); drawDoc(); drawTerm(); drawCube(); drawTaskbar(Date.now()); drawCursor();

            // Merge overlapping dirty rects into damage regions, snapped to a 16px grid.
            const regions = [];
            dirty.forEach(([x, y, w, h]) => {
                const r = [Math.max(0, Math.floor(x / 16) * 16), Math.max(0, Math.floor(y / 16) * 16), 0, 0];
                r[2] = Math.min(W, Math.ceil((x + w) / 16) * 16) - r[0]; r[3] = Math.min(H, Math.ceil((y + h) / 16) * 16) - r[1];
                for (let i = 0; i < regions.length; i++) {
                    const o = regions[i];
                    if (r[0] < o[0] + o[2] && r[0] + r[2] > o[0] && r[1] < o[1] + o[3] && r[1] + r[3] > o[1]) {
                        const x0 = Math.min(r[0], o[0]), y0 = Math.min(r[1], o[1]);
                        o[2] = Math.max(r[0] + r[2], o[0] + o[2]) - x0; o[3] = Math.max(r[1] + r[3], o[1] + o[3]) - y0; o[0] = x0; o[1] = y0;
                        return;
                    }
                }
                regions.push(r);
            });
            const n = regions.length;
            regions.forEach((r) => {
                const hit = touched.find((o) => r[0] < o[0] + o[2] && r[0] + r[2] > o[0] && r[1] < o[1] + o[3] && r[1] + r[3] > o[1]);
                if (hit) { const x0 = Math.min(r[0], hit[0]), y0 = Math.min(r[1], hit[1]); hit[2] = Math.max(r[0] + r[2], hit[0] + hit[2]) - x0; hit[3] = Math.max(r[1] + r[3], hit[1] + hit[3]) - y0; hit[0] = x0; hit[1] = y0; }
                else touched.push(r.slice());
            });
            const area = regions.reduce((acc, r) => acc + r[2] * r[3], 0) / (W * H);

            let state;
            if (n > 0) { quiet = 0; idle = false; paint = null; state = 'encoding ' + Math.round(area * 100) + '% of frame'; }
            else {
                quiet++;
                if (quiet === 40 && touched.length) paint = { t0: now };
                if (paint && now - paint.t0 > 700) { paint = null; touched = []; }
                if (paint) state = 'paint-over · 4:4:4';
                else if (quiet > 40) { idle = true; state = 'idle · 0 B/s'; }
                else state = 'settling';
            }
            const paintProgress = paint ? Math.min(1, (now - paint.t0) / 650) : null;
            drawOverlay(regions, paintProgress);

            if (hudStripes) hudStripes.textContent = String(n);
            if (hudState) hudState.textContent = state;
            if (hudBar) hudBar.style.width = (paint ? 100 : Math.min(100, area * 300)) + '%';

            raf = requestAnimationFrame(frame);
        }

        function start() { if (running) return; running = true; lastT = 0; if (!raf) raf = requestAnimationFrame(frame); }
        function stop() { running = false; }

        if (reduceMotion.matches) {
            // Static frame: a desktop with the paint-over legend, no animation.
            drawWallpaper(); drawDoc(); drawTerm(); drawCube(); drawTaskbar(Date.now()); drawCursor();
            idle = true; drawOverlay([], null);
            if (hudStripes) hudStripes.textContent = '0';
            if (hudState) hudState.textContent = 'idle · 0 B/s';
        } else {
            new IntersectionObserver((en) => { if (en[0].isIntersecting && !document.hidden) start(); else stop(); }, { threshold: 0.1 }).observe(canvas);
            document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else { const r = canvas.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) start(); } });
        }
    }
})();

/* Legacy inline hook kept for any copied markup that still calls it. */
function copyCode(btn) { btn.click(); }
