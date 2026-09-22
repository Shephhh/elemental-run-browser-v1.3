(function () {
    'use strict';

    const WIDTH = 960;
    const HEIGHT = 420;
    const PLAYER_X = 225;
    const FLOOR_Y = 386;
    const PIPE_WIDTH = 82;
    // One brisk attempt: worker and main-thread fallback receive identical tuning.
    const PIPE_GAP = 138;
    const PIPE_SPEED = 250;
    const PIPE_INTERVAL = 1.15;
    const GRAVITY = 830;
    const FLAP_SPEED = -350;
    const MAX_DT = 1 / 30;

    let root = null;
    let canvas = null;
    let ctx = null;
    let promptEl = null;
    let scoreEl = null;
    let progressEl = null;
    let progressFillEl = null;
    let loadingLabelEl = null;
    let introEl = null;
    let active = false;
    let expanded = false;
    let started = false;
    let alive = false;
    let loadingComplete = false;
    let resolved = false;
    let score = 0;
    let best = 0;
    let lastTime = 0;
    let animationFrame = 0;
    let sessionId = 0;
    let resolveCompletion = null;
    let completionPromise = Promise.resolve();
    let player = { y: HEIGHT * 0.46, velocity: 0, rotation: 0 };
    let visiblePipeCount = 0;
    let pipes = [];
    let embers = [];
    const pipePool = [];
    const emberPool = [];
    let spawnClock = 0;
    let idleClock = 0;
    let renderWorker = null;
    let renderWorkerUrl = '';
    let workerMode = false;
    let workerHeartbeatTimer = 0;
    let workerFps = 0;
    let preparationCount = 0;
    let pendingStart = false;
    let retryTimer = 0;
    let retryReadyAt = 0;
    let retryLocked = false;
    let language = 'en';
    let realProgress = 0;
    let displayedProgress = 0;
    let progressStartedAt = 0;
    let progressTimer = 0;

    function clearRetryDelay() {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = 0;
        retryReadyAt = 0;
        retryLocked = false;
    }

    function resolveLanguage() {
        const supported = window.ElementalLocalization?.LOADING_FLIGHT_TEXT || {};
        let saved = '';
        try {
            saved = JSON.parse(localStorage.getItem('elemental-run-steam-menu-state-v1') || 'null')?.language || '';
        } catch (error) {}
        if (supported[saved]) return saved;
        const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
        for (const locale of locales) {
            const tag = String(locale || '').toLowerCase();
            if (tag.startsWith('zh')) return /tw|hk|mo|hant/.test(tag) ? 'zh-Hant' : 'zh-Hans';
            if (tag.startsWith('es')) return /mx|ar|cl|co|pe|ve|uy|py|bo|ec|cr|cu|do|gt|hn|ni|pa|pr|sv/.test(tag) ? 'es-419' : 'es-ES';
            if (tag.startsWith('pt')) return tag.includes('pt-pt') ? 'pt-PT' : 'pt-BR';
            const code = tag.split('-')[0];
            if (supported[code]) return code;
            if (code === 'nb' || code === 'nn') return 'no';
        }
        return 'en';
    }

    function flightText(key) {
        const rows = window.ElementalLocalization?.LOADING_FLIGHT_TEXT;
        if (key === 'play') {
            const uiRows = window.ElementalLocalization?.UI_TRANSLATIONS;
            return uiRows?.[language]?.play || uiRows?.en?.play || 'PLAY';
        }
        return rows?.[language]?.[key] || rows?.en?.[key] || key;
    }

    function refreshLanguage() {
        language = resolveLanguage();
        if (!root) return;
        root.lang = language;
        root.dir = language === 'ar' ? 'rtl' : 'ltr';
        root.setAttribute('aria-label', flightText('gameLabel'));
        scoreEl?.setAttribute('aria-label', flightText('scoreLabel'));
        canvas?.setAttribute('aria-label', flightText('canvasLabel'));
        if (loadingLabelEl) loadingLabelEl.textContent = flightText('loading');
        if (!started) setPrompt(flightText('tapToFly'), true);
        else if (!alive && !retryLocked && !loadingComplete) setPrompt(flightText('retryToFly'), true);
    }

    async function runPreparation(work) {
        // Atomic gate: parsing/uploads never overlap a playable flight.
        while (active && started && alive) {
            await new Promise(resolve => setTimeout(resolve, 40));
        }
        preparationCount++;
        if (active && !started) setPrompt(flightText('tapToFly'), true);
        try {
            return await work();
        } finally {
            preparationCount--;
            if (active && !preparationCount && pendingStart && !alive) {
                pendingStart = false;
                flap();
            } else if (active && !preparationCount && !started && !loadingComplete) {
                setPrompt(flightText('tapToFly'), true);
            }
        }
    }

    // The real Three.js preload performs GLTF parsing, geometry merging and GPU
    // shader compilation on the page's main thread. Rendering the loading game
    // there as well made it freeze on slow machines. OffscreenCanvas keeps this
    // tiny 2D simulation on a dedicated worker; the original renderer below is
    // retained as a compatibility fallback for Safari/older WebViews.
    function loadingFlightWorkerMain() {
        'use strict';

        let canvas = null;
        let ctx = null;
        let width = 960;
        let height = 420;
        let playerX = 225;
        let floorY = 386;
        let pipeWidth = 82;
        let pipeGap = 138;
        let pipeSpeed = 250;
        let gravity = 830;
        let flapSpeed = -350;
        let pipeInterval = 1.15;
        let active = false;
        let started = false;
        let alive = false;
        let score = 0;
        let sessionId = 0;
        let lastTime = 0;
        let idleClock = 0;
        let spawnClock = 0;
        let frameCount = 0;
        let perfWindowStart = 0;
        let lastMainHeartbeat = 0;
        let player = { y: height * 0.46, velocity: 0, rotation: 0 };
        let pipes = [];
        let embers = [];
        const pipePool = [];
        const emberPool = [];
        let backgroundGradient = null;
        let pipeGradient = null;
        let backgroundLayer = null;
        let playerSprite = null;

        function makeGradients() {
            backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
            backgroundGradient.addColorStop(0, '#071629');
            backgroundGradient.addColorStop(0.56, '#17334a');
            backgroundGradient.addColorStop(1, '#48333f');
            pipeGradient = ctx.createLinearGradient(0, 0, pipeWidth, 0);
            pipeGradient.addColorStop(0, '#30271f');
            pipeGradient.addColorStop(0.5, '#74583b');
            pipeGradient.addColorStop(1, '#241e1a');
        }

        function preparePlayerSprite() {
            playerSprite = new OffscreenCanvas(80, 80);
            const art = playerSprite.getContext('2d');
            art.translate(40, 40);
            art.shadowBlur = 20;
            art.shadowColor = '#ff8b39';
            const flame = art.createRadialGradient(-4, -5, 2, 0, 0, 28);
            flame.addColorStop(0, '#ffffff');
            flame.addColorStop(0.25, '#fff17a');
            flame.addColorStop(0.62, '#ff7738');
            flame.addColorStop(1, '#9b1d5a');
            art.fillStyle = flame;
            art.beginPath();
            art.moveTo(-25, 14);
            art.quadraticCurveTo(-34, -6, -10, -29);
            art.quadraticCurveTo(18, -18, 26, 2);
            art.quadraticCurveTo(17, 25, -4, 25);
            art.quadraticCurveTo(-15, 23, -25, 14);
            art.fill();
            art.shadowBlur = 0;
            art.fillStyle = '#10213a';
            art.beginPath();
            art.arc(7, -4, 4.5, 0, Math.PI * 2);
            art.fill();
            art.fillStyle = '#82efff';
            art.beginPath();
            art.arc(8.5, -5.5, 1.7, 0, Math.PI * 2);
            art.fill();
        }

        function resetRun(startImmediately) {
            started = !!startImmediately;
            alive = !!startImmediately;
            score = 0;
            player.y = height * 0.46;
            player.velocity = startImmediately ? flapSpeed : 0;
            player.rotation = 0;
            while (pipes.length) pipePool.push(pipes.pop());
            while (embers.length) emberPool.push(embers.pop());
            spawnClock = 0;
            idleClock = 0;
            postMessage({ type: 'score', score: 0 });
        }

        function emitBurst(x, y, count) {
            for (let i = 0; i < count; i++) {
                const ember = emberPool.pop() || {};
                ember.x = x;
                ember.y = y;
                ember.vx = -70 - Math.random() * 100;
                ember.vy = (Math.random() - 0.5) * 90;
                ember.life = 0.22 + Math.random() * 0.28;
                ember.maxLife = 0.5;
                ember.size = 2 + Math.random() * 3;
                embers.push(ember);
            }
            while (embers.length > 48) emberPool.push(embers.shift());
        }

        function flap() {
            if (!started) {
                started = true;
                alive = true;
            }
            if (!alive) return;
            player.velocity = flapSpeed;
            emitBurst(playerX - 10, player.y + 5, 5);
        }

        function spawnPipe() {
            const seed = Math.sin((sessionId + 1) * 931.17 + (pipes.length + score + 1) * 177.31) * 43758.5453;
            const random = seed - Math.floor(seed);
            const center = 135 + random * 125;
            const pipe = pipePool.pop() || {};
            pipe.x = width + 30;
            pipe.center = center;
            pipe.counted = false;
            pipes.push(pipe);
        }

        function die() {
            if (!alive) return;
            alive = false;
            emitBurst(playerX, player.y, 16);
            postMessage({ type: 'death', score, playerY: player.y });
        }

        function update(dt) {
            idleClock += dt;
            for (let i = embers.length - 1; i >= 0; i--) {
                const ember = embers[i];
                ember.life -= dt;
                if (ember.life <= 0) {
                    emberPool.push(ember);
                    embers[i] = embers[embers.length - 1];
                    embers.pop();
                    continue;
                }
                ember.x += ember.vx * dt;
                ember.y += ember.vy * dt;
                ember.vy += 80 * dt;
            }
            if (!started || !alive) return;

            player.velocity += gravity * dt;
            player.y += player.velocity * dt;
            const targetRotation = Math.max(-0.55, Math.min(1, player.velocity / 540));
            player.rotation += (targetRotation - player.rotation) * (1 - Math.exp(-10 * dt));
            spawnClock += dt;
            if (!pipes.length || spawnClock >= pipeInterval) {
                spawnClock = 0;
                spawnPipe();
            }
            for (let i = pipes.length - 1; i >= 0; i--) {
                const pipe = pipes[i];
                pipe.x -= pipeSpeed * dt;
                if (!pipe.counted && pipe.x + pipeWidth < playerX) {
                    pipe.counted = true;
                    score += 1;
                    postMessage({ type: 'score', score });
                }
                if (pipe.x < -pipeWidth - 20) {
                    pipePool.push(pipe);
                    pipes[i] = pipes[pipes.length - 1];
                    pipes.pop();
                }
            }
            if ((frameCount & 1) === 0) emitBurst(playerX - 22, player.y + 8, 1);

            const radius = 18;
            if (player.y < radius) {
                player.y = radius;
                player.velocity = Math.max(0, player.velocity);
            }
            if (player.y + radius > floorY) {
                die();
                return;
            }
            for (const pipe of pipes) {
                if (playerX + radius < pipe.x || playerX - radius > pipe.x + pipeWidth) continue;
                const gapTop = pipe.center - pipeGap * 0.5;
                const gapBottom = pipe.center + pipeGap * 0.5;
                if (player.y - radius < gapTop || player.y + radius > gapBottom) {
                    die();
                    return;
                }
            }
        }

        function roundedRect(x, y, w, h, radius) {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
        }

        function drawBackground() {
            ctx.fillStyle = backgroundGradient;
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = 'rgba(207,225,231,.15)';
            for (let i = 0; i < 9; i++) {
                const x = ((i * 137 - idleClock * (8 + i % 3)) % (width + 180)) - 90;
                const y = 42 + (i % 4) * 66;
                ctx.beginPath();
                ctx.ellipse(x, y, 52, 17, 0, 0, Math.PI * 2);
                ctx.ellipse(x + 35, y - 8, 34, 22, 0, 0, Math.PI * 2);
                ctx.ellipse(x - 34, y - 3, 29, 18, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#183d35';
            ctx.beginPath();
            ctx.moveTo(0, floorY);
            for (let x = 0; x <= width; x += 80) {
                ctx.lineTo(x, 330 + Math.sin(x * 0.013) * 28 + Math.sin(x * 0.027) * 9);
            }
            ctx.lineTo(width, floorY);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#0a211d';
            ctx.fillRect(0, floorY, width, height - floorY);
            ctx.fillStyle = '#416f54';
            ctx.fillRect(0, floorY, width, 3);
        }

        function drawPipe(pipe) {
            const gapTop = pipe.center - pipeGap * 0.5;
            const gapBottom = pipe.center + pipeGap * 0.5;
            const drawSegment = (y, segmentHeight, capY) => {
                ctx.save();
                ctx.translate(pipe.x, 0);
                ctx.fillStyle = pipeGradient;
                roundedRect(0, y, pipeWidth, segmentHeight, 8);
                ctx.fill();
                ctx.strokeStyle = 'rgba(196,166,112,.62)';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = '#315f43';
                roundedRect(pipe.x - 8, capY, pipeWidth + 16, 16, 5);
                ctx.fill();
                ctx.strokeStyle = '#6ea56b';
                ctx.lineWidth = 2;
                ctx.stroke();
            };
            drawSegment(-10, Math.max(12, gapTop + 10), gapTop - 12);
            drawSegment(gapBottom, floorY - gapBottom, gapBottom - 4);
        }

        function drawPlayer() {
            const y = started ? player.y : player.y + Math.sin(idleClock * 2.8) * 9;
            ctx.save();
            ctx.translate(playerX, y);
            ctx.rotate(started ? player.rotation : -0.08);
            ctx.drawImage(playerSprite, -40, -40);
            ctx.restore();
        }

        function drawEmbers() {
            for (const ember of embers) {
                ctx.globalAlpha = Math.max(0, ember.life / ember.maxLife);
                ctx.fillStyle = ember.vy > 40 ? '#ff6947' : '#ffe36d';
                ctx.fillRect(ember.x, ember.y, ember.size, ember.size);
            }
            ctx.globalAlpha = 1;
        }

        function render() {
            if (!ctx) return;
            if (backgroundLayer) ctx.drawImage(backgroundLayer, 0, 0);
            else drawBackground();
            pipes.forEach(drawPipe);
            drawEmbers();
            drawPlayer();
        }

        function loop(now) {
            const dt = Math.min(1 / 30, Math.max(0, (now - lastTime) / 1000 || 0));
            lastTime = now;
            if (active) {
                frameCount += 1;
                // The engine can briefly occupy the main thread while parsing
                // assets. Freeze flight physics when input cannot reach us;
                // otherwise a missed click unfairly sends the spirit into the floor.
                if (now - lastMainHeartbeat < 180) update(dt);
                render();
                if (frameCount % 6 === 0) {
                    postMessage({ type: 'state', y: player.y, velocity: player.velocity, pipeCount: pipes.length });
                }
                if (frameCount % 60 === 0) {
                    const elapsed = Math.max(1, now - perfWindowStart);
                    postMessage({ type: 'perf', fps: 60000 / elapsed });
                    perfWindowStart = now;
                }
            }
            // Worker RAF can be throttled by the page's busy WebGL compositor
            // while Three.js precompiles shaders. Keep the tiny 2D game on its
            // own timer so physics/input do not inherit that render cadence.
            setTimeout(() => loop(performance.now()), active ? 16 : 100);
        }

        self.onmessage = (event) => {
            const message = event.data || {};
            if (message.type === 'init') {
                canvas = message.canvas;
                width = message.width || width;
                height = message.height || height;
                floorY = message.floorY || floorY;
                pipeGap = message.pipeGap || pipeGap;
                pipeSpeed = message.pipeSpeed || pipeSpeed;
                pipeInterval = message.pipeInterval || pipeInterval;
                gravity = message.gravity || gravity;
                flapSpeed = message.flapSpeed || flapSpeed;
                ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
                makeGradients();
                drawBackground();
                backgroundLayer = new OffscreenCanvas(width, height);
                backgroundLayer.getContext('2d', { alpha: false }).drawImage(canvas, 0, 0);
                preparePlayerSprite();
                resetRun(false);
                lastTime = performance.now();
                perfWindowStart = lastTime;
                postMessage({ type: 'ready' });
                setTimeout(() => loop(performance.now()), 0);
            } else if (message.type === 'reset') {
                sessionId = message.sessionId || sessionId;
                resetRun(false);
            } else if (message.type === 'flap') {
                flap();
            } else if (message.type === 'resume') {
                active = true;
                lastTime = performance.now();
                lastMainHeartbeat = lastTime;
                perfWindowStart = lastTime;
                frameCount = 0;
            } else if (message.type === 'heartbeat') {
                lastMainHeartbeat = performance.now();
            } else if (message.type === 'pause') {
                active = false;
            }
        };
    }

    try { best = Math.max(0, Number(localStorage.getItem('elemental-loading-flight-best')) || 0); } catch (error) {}

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function handleWorkerMessage(event) {
        const message = event.data || {};
        if (message.type === 'score') {
            score = Math.max(0, Number(message.score) || 0);
            if (scoreEl) scoreEl.textContent = String(score);
            return;
        }
        if (message.type === 'perf') {
            workerFps = Math.max(0, Number(message.fps) || 0);
            return;
        }
        if (message.type === 'state') {
            if (Number.isFinite(Number(message.y))) player.y = Number(message.y);
            player.velocity = Number(message.velocity) || 0;
            visiblePipeCount = Math.max(0, Number(message.pipeCount) || 0);
            return;
        }
        if (message.type === 'death') {
            score = Math.max(0, Number(message.score) || 0);
            player.y = Number(message.playerY) || player.y;
            if (scoreEl) scoreEl.textContent = String(score);
            die();
        }
    }

    function initializeWorkerRenderer() {
        if (!canvas || renderWorker || workerMode) return workerMode;
        if (typeof Worker !== 'function' || typeof Blob !== 'function' ||
            typeof canvas.transferControlToOffscreen !== 'function') return false;
        try {
            const source = `(${loadingFlightWorkerMain.toString()})();`;
            renderWorkerUrl = URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
            renderWorker = new Worker(renderWorkerUrl, { name: 'elemental-loading-flight' });
            renderWorker.addEventListener('message', handleWorkerMessage);
            renderWorker.addEventListener('error', (event) => {
                console.warn('[LoadingFlightWorker]', event.message || event);
            });
            const offscreen = canvas.transferControlToOffscreen();
            renderWorker.postMessage({
                type: 'init',
                canvas: offscreen,
                width: WIDTH,
                height: HEIGHT,
                floorY: FLOOR_Y,
                pipeGap: PIPE_GAP,
                pipeSpeed: PIPE_SPEED,
                pipeInterval: PIPE_INTERVAL,
                gravity: GRAVITY,
                flapSpeed: FLAP_SPEED
            }, [offscreen]);
            workerMode = true;
            return true;
        } catch (error) {
            console.warn('[LoadingFlightWorkerFallback]', error);
            if (renderWorker) renderWorker.terminate();
            renderWorker = null;
            if (renderWorkerUrl) URL.revokeObjectURL(renderWorkerUrl);
            renderWorkerUrl = '';
            workerMode = false;
            return false;
        }
    }

    function ensureUi() {
        if (root && root.isConnected) return root;
        root = makeElement('section', 'elemental-loading-flight');
        root.hidden = true;
        root.setAttribute('aria-label', flightText('gameLabel'));

        introEl = makeElement('button', 'elemental-loading-flight__intro');
        introEl.type = 'button';
        introEl.setAttribute('aria-label', flightText('tapToFly'));
        introEl.innerHTML = '<span class="elemental-loading-flight__intro-spirit" aria-hidden="true"><i></i></span><span class="elemental-loading-flight__intro-copy">PRESS TO PLAY</span>';

        const header = makeElement('header', 'elemental-loading-flight__header');
        const spinner = makeElement('div', 'elemental-loading-flight__spinner');
        spinner.setAttribute('aria-hidden', 'true');
        const brand = makeElement('div', 'elemental-loading-flight__brand');
        brand.append(
            makeElement('span', 'elemental-loading-flight__logo-main', 'ELEMENTAL'),
            makeElement('span', 'elemental-loading-flight__logo-sub', 'RUN')
        );
        header.append(spinner, brand);
        scoreEl = makeElement('div', 'elemental-loading-flight__score', '0');
        scoreEl.setAttribute('aria-label', flightText('scoreLabel'));

        const stage = makeElement('div', 'elemental-loading-flight__stage');
        canvas = document.createElement('canvas');
        canvas.className = 'elemental-loading-flight__canvas';
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.setAttribute('aria-label', flightText('canvasLabel'));
        canvas.setAttribute('role', 'img');
        promptEl = makeElement('button', 'elemental-loading-flight__prompt', flightText('tapToFly'));
        promptEl.type = 'button';
        stage.append(canvas, scoreEl, promptEl);

        const footer = makeElement('footer', 'elemental-loading-flight__footer');
        loadingLabelEl = makeElement('div', 'elemental-loading-flight__loading-label', flightText('loading'));
        const statusRow = makeElement('div', 'elemental-loading-flight__status');
        progressEl = makeElement('strong', '', '0%');
        statusRow.append(progressEl);
        const track = makeElement('div', 'elemental-loading-flight__track');
        track.setAttribute('role', 'progressbar');
        track.setAttribute('aria-valuemin', '0');
        track.setAttribute('aria-valuemax', '100');
        track.setAttribute('aria-valuenow', '0');
        progressFillEl = makeElement('div', 'elemental-loading-flight__fill');
        track.appendChild(progressFillEl);
        footer.append(loadingLabelEl, statusRow, track);

        root.append(header, introEl, stage, footer);
        document.body.appendChild(root);
        if (!initializeWorkerRenderer()) {
            ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        }

        promptEl.addEventListener('click', onFlapInput);
        introEl.addEventListener('click', onIntroInput);
        stage.addEventListener('pointerdown', (event) => {
            if (event.target === promptEl) return;
            onFlapInput(event);
        }, { passive: false });
        window.addEventListener('keydown', onKeyDown, { passive: false });
        document.addEventListener('visibilitychange', onVisibilityChange);
        return root;
    }

    function resetRun() {
        clearRetryDelay();
        started = false;
        alive = false;
        score = 0;
        visiblePipeCount = 0;
        player.y = HEIGHT * 0.46;
        player.velocity = 0;
        player.rotation = 0;
        while (pipes.length) pipePool.push(pipes.pop());
        while (embers.length) emberPool.push(embers.pop());
        spawnClock = 0;
        idleClock = 0;
        if (scoreEl) scoreEl.textContent = '0';
        setPrompt(flightText('tapToFly'), true);
        if (workerMode) renderWorker?.postMessage({ type: 'reset', sessionId });
    }

    function setPrompt(text, visible) {
        if (!promptEl) return;
        promptEl.textContent = text;
        promptEl.hidden = !visible;
    }

    function revealFullUi(startFlight = true) {
        if (!root || expanded) return;
        expanded = true;
        root.classList.remove('is-intro');
        root.classList.add('is-expanded');
        if (introEl) introEl.hidden = true;
        if (loadingComplete) return;
        if (startFlight) flap();
    }

    function onIntroInput(event) {
        if (!active) return;
        event?.preventDefault?.();
        event?.stopPropagation?.();
        revealFullUi(true);
    }

    function paintProgress(percent) {
        const safe = Math.max(0, Math.min(100, Number(percent) || 0));
        displayedProgress = safe;
        if (progressFillEl) progressFillEl.style.width = safe.toFixed(1) + '%';
        if (progressEl) progressEl.textContent = Math.floor(safe) + '%';
        progressEl?.parentElement?.nextElementSibling?.setAttribute('aria-valuenow', String(Math.floor(safe)));
    }

    function startFakeProgressClock() {
        if (progressTimer) clearInterval(progressTimer);
        progressStartedAt = performance.now();
        progressTimer = window.setInterval(() => {
            if (!active || loadingComplete) return;
            const elapsed = Math.max(0, (performance.now() - progressStartedAt) / 1000);
            // The display keeps moving during a flight even though expensive
            // parsing is correctly paused. It never claims readiness: 96% is
            // reserved for the real completion signal from game-runtime.
            const fakeTarget = Math.min(96, 4 + elapsed * 1.05);
            const target = Math.min(96, Math.max(fakeTarget, realProgress));
            const step = Math.max(0.08, Math.min(0.65, (target - displayedProgress) * 0.12));
            if (target > displayedProgress) paintProgress(Math.min(target, displayedProgress + step));
        }, 100);
    }

    function finishReadyGate(reason = 'loading-complete') {
        if (!root || !loadingComplete) return;
        root.classList.add('is-ready');
        setPrompt('', false);
        // The only post-load prompt is the existing one-time tutorial gate,
        // shown after this surface fades. Campaign loads continue directly.
        window.setTimeout(() => resolveGate(reason), 120);
    }

    function begin(options) {
        const opts = options || {};
        ensureUi();
        // DOMContentLoaded can expose the minigame a few milliseconds before
        // the large runtime calls begin(). Preserve an early player tap instead
        // of resetting their already-started flight during engine ownership.
        if (active && (!opts.host || root.parentElement === opts.host)) {
            return sessionId;
        }
        sessionId += 1;
        refreshLanguage();
        active = true;
        loadingComplete = false;
        expanded = false;
        realProgress = 0;
        displayedProgress = 0;
        pendingStart = false;
        resolved = false;
        lastTime = performance.now();
        resetRun();
        if (opts.host && opts.host.appendChild) opts.host.appendChild(root);
        else document.body.appendChild(root);
        root.hidden = false;
        root.dataset.mode = opts.mode || 'boot';
        root.classList.add('is-active');
        root.classList.add('is-intro');
        root.classList.remove('is-expanded', 'is-ready');
        if (introEl) {
            introEl.hidden = false;
            introEl.querySelector('.elemental-loading-flight__intro-copy').textContent = 'PRESS TO PLAY';
        }
        paintProgress(0);
        startFakeProgressClock();
        if (root.parentElement) root.parentElement.classList.add('has-loading-minigame');
        completionPromise = new Promise((resolve) => { resolveCompletion = resolve; });
        if (workerMode) renderWorker?.postMessage({ type: 'resume' });
        else if (!animationFrame) animationFrame = requestAnimationFrame(frame);
        if (workerMode && !workerHeartbeatTimer) {
            workerHeartbeatTimer = window.setInterval(() => {
                if (active) renderWorker?.postMessage({ type: 'heartbeat' });
            }, 80);
        }
        return sessionId;
    }

    function end(options) {
        const opts = options || {};
        active = false;
        pendingStart = false;
        clearRetryDelay();
        root?.classList.remove('is-active');
        if (root) root.hidden = true;
        if (root?.parentElement) root.parentElement.classList.remove('has-loading-minigame');
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        if (workerMode) renderWorker?.postMessage({ type: 'pause' });
        if (workerHeartbeatTimer) window.clearInterval(workerHeartbeatTimer);
        workerHeartbeatTimer = 0;
        if (progressTimer) window.clearInterval(progressTimer);
        progressTimer = 0;
        if (opts.force && !resolved) resolveGate('forced');
    }

    function setProgress(value, label, detail) {
        ensureUi();
        const percent = Math.max(0, Math.min(100, Number(value) || 0));
        realProgress = Math.max(realProgress, percent);
        if (percent >= 100) paintProgress(100);
    }

    function markLoadingComplete(options) {
        const opts = options || {};
        if (!active) return Promise.resolve('inactive');
        loadingComplete = true;
        if (progressTimer) window.clearInterval(progressTimer);
        progressTimer = 0;
        setProgress(100, opts.label || flightText('ready'), '');
        if (pendingStart && !alive && !preparationCount) {
            pendingStart = false;
            flap();
        }
        if (!started || !alive) {
            finishReadyGate(started ? 'flight-ended' : 'loading-complete');
        } else {
            setPrompt('', false);
        }
        return completionPromise;
    }

    function resolveGate(reason) {
        if (resolved) return;
        resolved = true;
        clearRetryDelay();
        const resolve = resolveCompletion;
        resolveCompletion = null;
        if (resolve) resolve(reason);
    }

    function onKeyDown(event) {
        if (!active) return;
        if (!expanded) {
            // Open the Flappy panel with any real key. Modifier-only presses
            // stay available to the browser and operating system.
            if (event.code === 'ShiftLeft' || event.code === 'ShiftRight' ||
                event.code === 'ControlLeft' || event.code === 'ControlRight' ||
                event.code === 'AltLeft' || event.code === 'AltRight' ||
                event.code === 'MetaLeft' || event.code === 'MetaRight') return;
            event.preventDefault();
            event.stopImmediatePropagation();
            revealFullUi(true);
            return;
        }
        if (event.code !== 'Space' && event.code !== 'ArrowUp' && event.code !== 'KeyW') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        flap();
    }

    function onFlapInput(event) {
        if (!active) return;
        event.preventDefault();
        event.stopPropagation();
        if (!expanded) {
            revealFullUi(true);
            return;
        }
        flap();
    }

    function flap() {
        if (!active || resolved) return;
        if (loadingComplete) {
            if (!alive) finishReadyGate('loading-complete');
            return;
        }
        if (retryLocked || performance.now() < retryReadyAt) return;
        if (preparationCount > 0) {
            if (!alive) {
                pendingStart = true;
                setPrompt(flightText('tapToFly'), true);
            }
            return;
        }
        pendingStart = false;
        if (!alive) {
            if (started) resetRun();
            started = true;
            alive = true;
            setPrompt('', false);
        }
        if (workerMode) {
            renderWorker?.postMessage({ type: 'flap', sessionId });
            return;
        }
        player.velocity = FLAP_SPEED;
        emitBurst(PLAYER_X - 10, player.y + 5, 8);
    }

    function onVisibilityChange() {
        if (!active) return;
        lastTime = performance.now();
        if (workerMode) renderWorker?.postMessage({ type: document.hidden ? 'pause' : 'resume' });
    }

    function spawnPipe() {
        const seed = Math.sin((sessionId + 1) * 931.17 + (pipes.length + score + 1) * 177.31) * 43758.5453;
        const random = seed - Math.floor(seed);
        const center = 135 + random * 125;
        const pipe = pipePool.pop() || {};
        pipe.x = WIDTH + 30;
        pipe.center = center;
        pipe.counted = false;
        pipes.push(pipe);
    }

    function emitBurst(x, y, count) {
        for (let i = 0; i < count; i++) {
            const ember = emberPool.pop() || {};
            ember.x = x;
            ember.y = y;
            ember.vx = -80 - Math.random() * 130;
            ember.vy = (Math.random() - 0.5) * 110;
            ember.life = 0.25 + Math.random() * 0.35;
            ember.maxLife = 0.6;
            ember.size = 2 + Math.random() * 4;
            embers.push(ember);
        }
        while (embers.length > 90) emberPool.push(embers.shift());
    }

    function die() {
        if (!alive) return;
        alive = false;
        pendingStart = false;
        best = Math.max(best, score);
        try { localStorage.setItem('elemental-loading-flight-best', String(best)); } catch (error) {}
        emitBurst(PLAYER_X, player.y, 24);
        if (loadingComplete) {
            setPrompt('', false);
            setTimeout(() => finishReadyGate('flight-ended'), 260);
        } else {
            retryLocked = true;
            retryReadyAt = performance.now() + 2000;
            setPrompt('', false);
            const deathSession = sessionId;
            retryTimer = setTimeout(() => {
                retryTimer = 0;
                if (!active || resolved || loadingComplete || deathSession !== sessionId || alive) return;
                retryLocked = false;
                setPrompt(flightText('retryToFly'), true);
            }, 2000);
        }
    }

    function update(dt) {
        idleClock += dt;
        for (let i = embers.length - 1; i >= 0; i--) {
            const ember = embers[i];
            ember.life -= dt;
            if (ember.life <= 0) {
                emberPool.push(ember);
                embers[i] = embers[embers.length - 1];
                embers.pop();
                continue;
            }
            ember.x += ember.vx * dt;
            ember.y += ember.vy * dt;
            ember.vy += 80 * dt;
        }
        if (!started || !alive) return;

        player.velocity += GRAVITY * dt;
        player.y += player.velocity * dt;
        player.rotation += ((Math.max(-0.55, Math.min(1.0, player.velocity / 540))) - player.rotation) * (1 - Math.exp(-10 * dt));
        spawnClock += dt;
        if (!pipes.length || spawnClock >= PIPE_INTERVAL) {
            spawnClock = 0;
            spawnPipe();
        }
        for (let i = pipes.length - 1; i >= 0; i--) {
            const pipe = pipes[i];
            pipe.x -= PIPE_SPEED * dt;
            if (!pipe.counted && pipe.x + PIPE_WIDTH < PLAYER_X) {
                pipe.counted = true;
                score += 1;
                scoreEl.textContent = String(score);
            }
            if (pipe.x < -PIPE_WIDTH - 20) {
                pipePool.push(pipe);
                pipes[i] = pipes[pipes.length - 1];
                pipes.pop();
            }
        }
        emitBurst(PLAYER_X - 22, player.y + 8, 1);

        const radius = 18;
        if (player.y < radius) {
            player.y = radius;
            player.velocity = Math.max(0, player.velocity);
        }
        if (player.y + radius > FLOOR_Y) {
            die();
            return;
        }
        for (const pipe of pipes) {
            if (PLAYER_X + radius < pipe.x || PLAYER_X - radius > pipe.x + PIPE_WIDTH) continue;
            const gapTop = pipe.center - PIPE_GAP * 0.5;
            const gapBottom = pipe.center + PIPE_GAP * 0.5;
            if (player.y - radius < gapTop || player.y + radius > gapBottom) {
                die();
                return;
            }
        }
    }

    function roundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
    }

    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        gradient.addColorStop(0, '#071629');
        gradient.addColorStop(0.56, '#17334a');
        gradient.addColorStop(1, '#48333f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Soft cloud layers replace the previous neon/cyber grid. Their motion
        // is deterministic and uses no textures or per-frame allocations.
        ctx.fillStyle = 'rgba(207,225,231,.15)';
        for (let i = 0; i < 9; i++) {
            const x = ((i * 137 - idleClock * (8 + i % 3)) % (WIDTH + 180)) - 90;
            const y = 42 + (i % 4) * 66;
            ctx.beginPath();
            ctx.ellipse(x, y, 52, 17, 0, 0, Math.PI * 2);
            ctx.ellipse(x + 35, y - 8, 34, 22, 0, 0, Math.PI * 2);
            ctx.ellipse(x - 34, y - 3, 29, 18, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#183d35';
        ctx.beginPath();
        ctx.moveTo(0, FLOOR_Y);
        for (let x = 0; x <= WIDTH; x += 80) {
            ctx.lineTo(x, 330 + Math.sin(x * 0.013) * 28 + Math.sin(x * 0.027) * 9);
        }
        ctx.lineTo(WIDTH, FLOOR_Y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0a211d';
        ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
        ctx.fillStyle = '#416f54';
        ctx.fillRect(0, FLOOR_Y, WIDTH, 3);
    }

    function drawPipe(pipe) {
        const gapTop = pipe.center - PIPE_GAP * 0.5;
        const gapBottom = pipe.center + PIPE_GAP * 0.5;
        const drawSegment = (y, height, capY) => {
            const g = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
            g.addColorStop(0, '#30271f');
            g.addColorStop(0.5, '#74583b');
            g.addColorStop(1, '#241e1a');
            ctx.fillStyle = g;
            roundedRect(pipe.x, y, PIPE_WIDTH, height, 8);
            ctx.fill();
            ctx.strokeStyle = 'rgba(196,166,112,.62)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#315f43';
            roundedRect(pipe.x - 8, capY, PIPE_WIDTH + 16, 16, 5);
            ctx.fill();
            ctx.strokeStyle = '#6ea56b';
            ctx.lineWidth = 2;
            ctx.stroke();
        };
        drawSegment(-10, Math.max(12, gapTop + 10), gapTop - 12);
        drawSegment(gapBottom, FLOOR_Y - gapBottom, gapBottom - 4);
    }

    function drawPlayer() {
        const y = started ? player.y : player.y + Math.sin(idleClock * 2.8) * 9;
        ctx.save();
        ctx.translate(PLAYER_X, y);
        ctx.rotate(started ? player.rotation : -0.08);
        ctx.shadowBlur = 24;
        ctx.shadowColor = '#ffb02e';
        const flame = ctx.createRadialGradient(-4, -5, 2, 0, 0, 28);
        flame.addColorStop(0, '#ffffff');
        flame.addColorStop(0.25, '#fff17a');
        flame.addColorStop(0.62, '#ff7738');
        flame.addColorStop(1, '#9b1d5a');
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.moveTo(-25, 14);
        ctx.quadraticCurveTo(-34, -6, -10, -29);
        ctx.quadraticCurveTo(18, -18, 26, 2);
        ctx.quadraticCurveTo(17, 25, -4, 25);
        ctx.quadraticCurveTo(-15, 23, -25, 14);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#10213a';
        ctx.beginPath();
        ctx.arc(7, -4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#82efff';
        ctx.beginPath();
        ctx.arc(8.5, -5.5, 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawEmbers() {
        for (const ember of embers) {
            ctx.globalAlpha = Math.max(0, ember.life / ember.maxLife);
            ctx.fillStyle = ember.vy > 40 ? '#ff6947' : '#ffe36d';
            ctx.fillRect(ember.x, ember.y, ember.size, ember.size);
        }
        ctx.globalAlpha = 1;
    }

    function render() {
        if (!ctx) return;
        drawBackground();
        pipes.forEach(drawPipe);
        drawEmbers();
        drawPlayer();
    }

    function frame(now) {
        animationFrame = 0;
        if (!active) return;
        const dt = Math.min(MAX_DT, Math.max(0, (now - lastTime) / 1000 || 0));
        lastTime = now;
        update(dt);
        render();
        animationFrame = requestAnimationFrame(frame);
    }

    function getState() {
        return {
            active,
            preparing: preparationCount > 0,
            language,
            pendingStart,
            retryLocked,
            retryRemainingMs: retryLocked ? Math.max(0, Math.ceil(retryReadyAt - performance.now())) : 0,
            started,
            alive,
            loadingComplete,
            score,
            best,
            progress: Number(progressEl?.textContent?.replace('%', '')) || 0,
            renderer: workerMode ? 'offscreen-worker' : 'main-thread-fallback',
            fps: workerMode ? Math.round(workerFps * 10) / 10 : null,
            playerY: Math.round(player.y),
            playerVelocity: Math.round(player.velocity),
            visiblePipeCount: workerMode ? visiblePipeCount : pipes.length
        };
    }

    window.ElementalLoadingMinigame = Object.freeze({
        begin,
        end,
        setProgress,
        markLoadingComplete,
        getState,
        runPreparation
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const host = document.getElementById('loading-screen');
            if (host && !active) begin({ host, mode: 'boot' });
        }, { once: true });
    } else {
        const host = document.getElementById('loading-screen');
        if (host && !active) begin({ host, mode: 'boot' });
    }
})();
