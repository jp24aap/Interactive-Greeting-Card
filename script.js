// Set the secret date the recipient must enter (DD/MM/YYYY)
const correctAnswer = "01/01/2025";  // <-- CHANGE THIS to your secret date
const questionContainer = document.getElementById('question-container');
const giftCard = document.getElementById('gift-card');
const errorMessage = document.getElementById('error-message');
const floatingElements = document.querySelector('.floating-elements');
const photoLanes = document.querySelector('.photo-lanes');
const bgAudio = document.getElementById('bg-audio');
const celebrationOverlay = document.getElementById('celebration-overlay');
let celebrationCanvas, celebrationCtx, celebrationParticles = [], celebrationAnimId = null;
let celebrationLastTs = null;
// decorations removed per request

// Ensure gift card is hidden initially
giftCard.classList.add('hidden');

function createFloatingElement() {
    const elements = [
        { type: 'heart', emoji: '❤️' },
        { type: 'heart', emoji: '💖' },
        { type: 'heart', emoji: '💝' },
        { type: 'flower', emoji: '🌸' },
        { type: 'flower', emoji: '🌹' },
        { type: 'flower', emoji: '🌺' },
        { type: 'flower', emoji: '🌷' },
        { type: 'flower', emoji: '💐' }
    ];

    const element = elements[Math.floor(Math.random() * elements.length)];
    const div = document.createElement('div');
    div.className = 'floating-element';
    div.textContent = element.emoji;
    div.style.fontSize = `${Math.random() * 30 + 20}px`;
    div.style.left = `${Math.random() * 100}%`;

    const fallDuration = 15 + Math.random() * 10; // 15-25s
    div.style.animation = `fall ${fallDuration}s linear infinite`;

    if (Math.random() > 0.6) {
        div.classList.add('blurred');
    }

    floatingElements.appendChild(div);

    // remove only after it should be past 130vh
    setTimeout(() => {
        div.remove();
    }, (fallDuration * 1000) + 1500);
}

function createFallingText() {
    const loveMessages = [
        "Happy Birthday!",              // English
        "¡Feliz Cumpleaños!",           // Spanish
        "Joyeux Anniversaire!",         // French
        "Alles Gute zum Geburtstag!",   // German
        "Buon Compleanno!",             // Italian
        "Feliz Aniversário!",           // Portuguese
        "С Днём Рождения!",             // Russian
        "お誕生日おめでとう!",              // Japanese
        "생일 축하해요!",                  // Korean
        "生日快乐!",                      // Chinese (Simplified)
        "जन्मदिन मुबारक!",              // Hindi
        "শুভ জন্মদিন!",                  // Bengali
        "Selamat Ulang Tahun!",         // Indonesian
        "Doğum Günün Kutlu Olsun!",     // Turkish
        "Maligayang Kaarawan!",         // Tagalog
        "Gefeliciteerd!",               // Dutch
        "Grattis på födelsedagen!",     // Swedish
        "Gratulerer med dagen!",        // Norwegian
        "Wszystkiego najlepszego!",     // Polish
        "Χρόνια πολλά!"                 // Greek
    ];

    const text = loveMessages[Math.floor(Math.random() * loveMessages.length)];
    const div = document.createElement('div');
    div.className = 'falling-text';
    div.textContent = text;

    // Randomize size slightly
    const fontSize = Math.random() * 1.5 + 1.2; // 1.2rem to 2.7rem
    div.style.fontSize = `${fontSize}rem`;

    // Randomize horizontal position
    div.style.left = `${Math.random() * 90}%`; // Avoid right edge overflow

    // Randomize fall duration
    const fallDuration = 20 + Math.random() * 10; // 20-30s (slower than emojis)
    div.style.animationDuration = `${fallDuration}s`;

    if (Math.random() > 0.7) {
        div.classList.add('blurred');
    }

    floatingElements.appendChild(div);

    // Cleanup
    setTimeout(() => {
        div.remove();
    }, (fallDuration * 1000) + 2000);
}

function startFloatingElements() {
    // Initial spawn of emojis (increased to 70)
    for (let i = 0; i < 70; i++) {
        setTimeout(() => {
            createFloatingElement();
        }, i * 180);
    }

    // Initial spawn of text (increased to 14)
    for (let i = 0; i < 14; i++) {
        setTimeout(() => {
            createFallingText();
        }, i * 700);
    }

    const intervalMs = 250; // Adjusted to 250ms
    const textIntervalMs = 1500; // Adjusted to 1500ms
    let nextAt = performance.now() + intervalMs;
    let nextTextAt = performance.now() + textIntervalMs;

    function spawnLoop(now) {
        // Spawn emojis
        while (now >= nextAt) {
            createFloatingElement();
            nextAt += intervalMs;
        }

        // Spawn text
        while (now >= nextTextAt) {
            createFallingText();
            nextTextAt += textIntervalMs;
        }

        requestAnimationFrame(spawnLoop);
    }
    requestAnimationFrame(spawnLoop);
}

// Celebration fireworks (overlay)
function initCelebrationCanvas() {
    celebrationCanvas = document.getElementById('celebration-canvas');
    if (!celebrationCanvas) return;
    celebrationCtx = celebrationCanvas.getContext('2d');
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    celebrationCanvas.style.width = cssW + 'px';
    celebrationCanvas.style.height = cssH + 'px';
    celebrationCanvas.width = Math.floor(cssW * dpr);
    celebrationCanvas.height = Math.floor(cssH * dpr);
    celebrationCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function launchCelebrationBurst(x, y, hue, power = 2.2) {
    const count = Math.floor(80 * power);
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = (Math.random() * 3 + 2) * power;
        celebrationParticles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            life: Math.random() * 0.6 + 0.7,
            color: `hsl(${hue}, 100%, 60%)`,
            size: Math.random() * 2 + 1.2
        });
    }
}

function updateCelebration(ts) {
    if (!celebrationCtx || !celebrationCanvas) return;
    const now = ts || performance.now();
    const dtMs = celebrationLastTs == null ? 16.67 : Math.min(50, now - celebrationLastTs);
    const dtFactor = dtMs / 16.67;
    celebrationLastTs = now;
    celebrationCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
    for (let i = celebrationParticles.length - 1; i >= 0; i--) {
        const p = celebrationParticles[i];
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;
        const drag = Math.pow(0.985, dtFactor);
        p.vx *= drag;
        p.vy = p.vy * drag + 0.02 * dtFactor;
        p.alpha -= 0.012 * dtFactor;
        p.life -= 0.012 * dtFactor;
        if (p.alpha <= 0 || p.life <= 0) {
            celebrationParticles.splice(i, 1);
            continue;
        }
        celebrationCtx.globalAlpha = p.alpha;
        celebrationCtx.fillStyle = p.color;
        celebrationCtx.beginPath();
        celebrationCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        celebrationCtx.fill();
        celebrationCtx.globalAlpha = 1;
    }
    celebrationAnimId = requestAnimationFrame(updateCelebration);
}

function showCelebrationOverlay(durationMs = 3500) {
    if (!celebrationOverlay) return Promise.resolve();
    celebrationOverlay.classList.remove('hidden');
    initCelebrationCanvas();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2 - 80;
    launchCelebrationBurst(cx - 200, cy - 120, 340, 2.6);
    launchCelebrationBurst(cx, cy - 180, 20, 3.0);
    launchCelebrationBurst(cx + 200, cy - 120, 200, 2.6);
    celebrationLastTs = null;
    if (!celebrationAnimId) celebrationAnimId = requestAnimationFrame(updateCelebration);
    return new Promise(resolve => {
        setTimeout(() => {
            celebrationOverlay.style.opacity = '0';
            setTimeout(() => {
                cancelAnimationFrame(celebrationAnimId);
                celebrationAnimId = null;
                celebrationParticles = [];
                celebrationOverlay.classList.add('hidden');
                celebrationOverlay.style.opacity = '';
                // setup background video on gift-card if present
                const gc = document.getElementById('gift-card');
                const vid = document.getElementById('bg-video');
                if (gc && vid) {
                    gc.classList.add('has-video');
                    // try to play; ignore errors
                    try { vid.play(); } catch (e) { }
                }
                resolve();
            }, 1000);
        }, durationMs);
    });
}


// Photo frames logic
const NUM_LANES = 7; // fixed columns
const TOTAL_PHOTOS = 18; // fewer frames overall for lighter density
const BASE_FRAME_HEIGHT_PX = 180; // CSS base height
const FALL_DURATION_MS = 20000; // keep in sync with CSS
const VIEWPORT_HEIGHT_PX = () => window.innerHeight || 800;
const MIN_VERTICAL_GAP_PX = 70; // extra breathing room between frames (reduced density)

function createPhotoFrame(src, laneIndex, delayMs, scale = 1, xJitterPct = 0) {
    const frame = document.createElement('div');
    frame.className = `photo-frame lane-${laneIndex}`;
    // consistent path is controlled via CSS keyframes; do not offset top inline
    // keep a tiny negative margin to reduce initial pop-in
    frame.style.top = `-1px`;
    frame.style.animationDelay = `${delayMs}ms`;

    // randomize rotation start and delta per frame
    const startDeg = Math.floor(Math.random() * 360);
    const rotationSpan = 270 + Math.random() * 360; // 270-630 deg
    const direction = Math.random() < 0.5 ? -1 : 1;
    frame.style.setProperty('--rot-start', `${startDeg}deg`);
    frame.style.setProperty('--rot-delta', `${direction * rotationSpan}deg`);
    frame.style.setProperty('--scale', `${scale}`);

    // horizontal jitter within lane: adjust left percentage around lane center
    // lane classes position center; we apply additional translateX via CSS variable by adjusting left
    // We simulate by shifting "left" percentage with small bias from lane center using calc inlined below
    const laneCenters = [1 / 14, 3 / 14, 5 / 14, 7 / 14, 9 / 14, 11 / 14, 13 / 14];
    const centerPct = laneCenters[laneIndex] * 100;
    const jitterPct = xJitterPct * 100; // e.g., -2 to +2 percent
    frame.style.left = `calc(${centerPct}% + ${jitterPct}%)`;

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Memory photo';
    const inner = document.createElement('div');
    inner.className = 'inner-border';

    frame.appendChild(img);
    frame.appendChild(inner);
    photoLanes.appendChild(frame);

    // cleanup after one full cycle to avoid DOM bloat
    const durationMs = FALL_DURATION_MS;
    setTimeout(() => {
        frame.remove();
    }, durationMs + delayMs + 1000);
}

// Per-lane scheduler to avoid vertical overlap
const laneState = Array.from({ length: NUM_LANES }, () => ({ nextAvailableTime: 0 }));

function computeMinSpawnIntervalMs(scale = 1) {
    const distanceToTravelPx = VIEWPORT_HEIGHT_PX() + (0.6 * VIEWPORT_HEIGHT_PX()); // from -30vh to 130vh
    const pxPerMs = distanceToTravelPx / FALL_DURATION_MS;
    const effectiveHeight = BASE_FRAME_HEIGHT_PX * scale;
    const minGapMs = (effectiveHeight + MIN_VERTICAL_GAP_PX) / pxPerMs;
    return Math.ceil(minGapMs);
}

function scheduleSpawnForLane(lane, src, baseDelayMs = 0, scale = 1, jitter = 0) {
    const now = performance.now();
    const minInterval = computeMinSpawnIntervalMs(scale);
    const availableAt = Math.max(laneState[lane].nextAvailableTime, now + baseDelayMs);
    const delay = Math.max(0, availableAt - now);
    laneState[lane].nextAvailableTime = availableAt + minInterval;
    createPhotoFrame(src, lane, delay, scale, jitter);
}

function startPhotoFrames() {
    if (!photoLanes) return;
    // Use actual images from the 'All photo memories' folder
    // Replace these with your own photo paths
    const placeholders = [
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+1',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+2',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+3',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+4',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+5',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+6',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+7',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+8',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+9',
        'https://placehold.co/300x360/ffe3e9/ff4d6d?text=Photo+10'
    ];

    // global scheduler: spawn into random lanes while respecting each lane's spacing
    const globalIntervalMs = Math.max(400, FALL_DURATION_MS / TOTAL_PHOTOS * 1.35);

    // kickstart a handful so it feels populated quickly, but randomized across lanes
    for (let k = 0; k < Math.min(5, TOTAL_PHOTOS); k++) {
        const lane = Math.floor(Math.random() * NUM_LANES);
        const idx = Math.floor(Math.random() * placeholders.length);
        const scale = 0.8 + Math.random() * 0.6; // 0.8x to 1.4x
        const jitter = (Math.random() - 0.5) * 0.08; // +/-4% of viewport width relative shift
        scheduleSpawnForLane(lane, placeholders[idx], k * 250, scale, jitter);
    }

    setInterval(() => {
        const lane = Math.floor(Math.random() * NUM_LANES);
        const idx = Math.floor(Math.random() * placeholders.length);
        const scale = 0.8 + Math.random() * 0.6; // 0.8x to 1.4x
        const jitter = (Math.random() - 0.5) * 0.08; // +/-4%
        scheduleSpawnForLane(lane, placeholders[idx], 0, scale, jitter);
    }, globalIntervalMs);
}

async function startAudio() {
    try {
        bgAudio.loop = true;
        bgAudio.currentTime = 0;
        await bgAudio.play();
    } catch (e) {
        // Autoplay may be blocked; no UI shown per user's preference
    }
}

function initializeDateSelectors() {
    const daySelect = document.getElementById('day-select');
    const yearSelect = document.getElementById('year-select');

    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i.toString().padStart(2, '0');
        option.textContent = i.toString().padStart(2, '0');
        daySelect.appendChild(option);
    }

    for (let i = 2000; i <= 4000; i++) {
        const option = document.createElement('option');
        option.value = i.toString();
        option.textContent = i.toString();
        yearSelect.appendChild(option);
    }
}

// Fireworks implementation
let fwCanvas;
let fwCtx;
let fireworks = [];
let particles = [];
let fwAnimationId = null;
let fwLastTs = null;

function initFireworks() {
    fwCanvas = document.getElementById('fireworks-canvas');
    if (!fwCanvas) return;
    fwCtx = fwCanvas.getContext('2d');
    resizeFireworksCanvas();
    window.addEventListener('resize', resizeFireworksCanvas);
}

function resizeFireworksCanvas() {
    if (!fwCanvas) return;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    fwCanvas.style.width = cssW + 'px';
    fwCanvas.style.height = cssH + 'px';
    fwCanvas.width = Math.floor(cssW * dpr);
    fwCanvas.height = Math.floor(cssH * dpr);
    fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function launchFirework(x, y, color, power = 1) {
    const hue = color || Math.floor(Math.random() * 360);
    const count = Math.floor(40 * power);
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = (Math.random() * 3 + 2) * power;
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            life: Math.random() * 0.5 + 0.5,
            color: `hsl(${hue}, 100%, 60%)`,
            size: Math.random() * 2 + 1
        });
    }
}

function updateFireworks(ts) {
    const now = ts || performance.now();
    const dtMs = fwLastTs == null ? 16.67 : Math.min(50, now - fwLastTs);
    const dtFactor = dtMs / 16.67;
    fwLastTs = now;
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

    // Draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;
        const drag = Math.pow(0.985, dtFactor);
        p.vx *= drag; // slight drag
        p.vy = p.vy * drag + 0.02 * dtFactor; // gravity
        p.alpha -= 0.01 * dtFactor;
        p.life -= 0.01 * dtFactor;

        if (p.alpha <= 0 || p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        fwCtx.globalAlpha = p.alpha;
        fwCtx.fillStyle = p.color;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fwCtx.fill();
        fwCtx.globalAlpha = 1;
    }

    fwAnimationId = requestAnimationFrame(updateFireworks);
}

function startFireworksSequence() {
    initFireworks();

    // Initial celebratory burst (3 big blasts around center)
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    launchFirework(cx - 120, cy - 60, 340, 2.2);
    launchFirework(cx, cy - 120, 20, 2.6);
    launchFirework(cx + 120, cy - 60, 200, 2.2);

    // Subtle continuous fireworks
    const intervalMs = 2500;
    let nextAt = performance.now() + intervalMs;
    function burstLoop(now) {
        while (now >= nextAt) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.5); // top half for realism
            const hue = Math.floor(Math.random() * 360);
            launchFirework(x, y, hue, 0.8); // smaller bursts
            nextAt += intervalMs;
        }
        requestAnimationFrame(burstLoop);
    }
    requestAnimationFrame(burstLoop);

    fwLastTs = null;
    if (!fwAnimationId) {
        fwAnimationId = requestAnimationFrame(updateFireworks);
    }
}

function checkAnswer() {
    const day = document.getElementById('day-select').value;
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;

    if (!day || !month || !year) {
        errorMessage.textContent = "Please select all fields";
        return;
    }

    const userAnswer = `${day}/${month}/${year}`;

    if (userAnswer === correctAnswer) {
        showCelebrationOverlay(3500).then(() => {
            questionContainer.classList.add('hidden');
            giftCard.classList.remove('hidden');
            startFloatingElements();
            startPhotoFrames();
            startAudio();
            startFireworksSequence();

            // Show letter notification after a short delay
            setTimeout(() => {
                const notification = document.getElementById('message-notification');
                if (notification) {
                    notification.classList.remove('hidden');
                }
            }, 4000);
        });
    } else {
        errorMessage.textContent = "That's not correct. Try to remember...";
    }
}

// Initialize the date selectors when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDateSelectors();
});

// Add event listener for Enter key
// Submit with Enter from any select
['day-select', 'month-select', 'year-select'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkAnswer();
            }
        });
    }
});

// Letter Modal Logic
function openLetterModal() {
    const modal = document.getElementById('letter-modal');
    modal.classList.remove('hidden');
    // Hide notification while modal is open
    document.getElementById('message-notification').classList.add('hidden');
}

function closeLetterModal() {
    const modal = document.getElementById('letter-modal');
    modal.classList.add('hidden');
    // Show notification again so they can re-read if they want
    document.getElementById('message-notification').classList.remove('hidden');
}