
// Import tokens (simulated here since we can't fetch local files easily in vanilla JS without a server, 
// I will embed the data structure for the demo logic)
// In a real build, this would import 'tokens.json'
const tokens = {
    Motion: {
        Smooth: {
            Fastest: { Web: { duration: "0.25s", easing: "linear" /* approximated for demo */ }, iOS: "167ms / 0", Android: "Stiff: 1455" },
            Fast: { Web: { duration: "0.25s", easing: "linear" }, iOS: "255ms / 0", Android: "Stiff: 627" },
            Default: { Web: { duration: "0.334s", easing: "linear" }, iOS: "334ms / 0", Android: "Stiff: 384" }
        },
        Snappy: {
            Fastest: { Web: { duration: "0.25s", easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }, iOS: "167ms / 0.15", Android: "Stiff: 1455, Dump: 0.9" },
            Fast: { Web: { duration: "0.25s", easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }, iOS: "255ms / 0.15", Android: "Stiff: 627, Dump: 0.9" },
            Default: { Web: { duration: "0.334s", easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }, iOS: "334ms / 0.15", Android: "Stiff: 384, Dump: 0.9" }
        },
        Bouncy: {
            Fastest: { Web: { duration: "0.25s", easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }, iOS: "167ms / 0.3", Android: "Stiff: 1455, Dump: 0.7" },
            Fast: { Web: { duration: "0.25s", easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }, iOS: "255ms / 0.3", Android: "Stiff: 627, Dump: 0.7" },
            Default: { Web: { duration: "0.334s", easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }, iOS: "334ms / 0.3", Android: "Stiff: 384, Dump: 0.7" }
        }
    }
};

const sheetOverlay = document.getElementById('sheetOverlay');
const sheetSurface = document.getElementById('sheetSurface');
const openBtn = document.getElementById('openSheetBtn');
const closeBtn = document.getElementById('headerCloseBtn');
const footerConfirmBtn = document.getElementById('footerConfirmBtn');
const motionSelect = document.getElementById('motionSelect');
const root = document.documentElement;

// Labels
const valWebDur = document.getElementById('val-web-dur');
const valIOS = document.getElementById('val-ios');
const valAndroid = document.getElementById('val-android');

// Code blocks
const codeWeb = document.querySelector('#code-web code');
const codeSwift = document.querySelector('#code-swift code');
const codeCompose = document.querySelector('#code-compose code');

// State
let currentMotion = { type: 'Smooth', speed: 'Default' };

function updateTokens(type, speed) {
    const data = tokens.Motion[type][speed];

    // Update CSS variables
    root.style.setProperty('--motion-duration', data.Web.duration);
    root.style.setProperty('--motion-easing', data.Web.easing);

    // Update Spec Labels
    valWebDur.textContent = `${data.Web.duration}`;
    valIOS.textContent = `${data.iOS}`;
    valAndroid.textContent = `${data.Android}`;

    // Update Code Snippets
    updateCodeSnippets(type, speed, data);
}

function updateCodeSnippets(type, speed, data) {
    const variantName = `${type} ${speed}`;

    // Web
    codeWeb.textContent = `/* Web Implementation */
.sheet-container {
  /* Token: Motion.${type}.${speed} */
  transition: transform ${data.Web.duration} ${data.Web.easing};
}`;

    // Swift
    codeSwift.textContent = `// SwiftUI Implementation
struct SheetView: View {
    // Token: Motion.${type}.${speed}
    // iOS: ${data.iOS}
    var animation: Animation {
        .interpolatingSpring(stiffness: ${data.Android.split(':')[1]}, damping: 30) // Approximation
    }
}`;

    // Compose
    codeCompose.textContent = `// Jetpack Compose Implementation
@Composable
fun Sheet() {
    // Token: Motion.${type}.${speed}
    // Android: ${data.Android}
    val animationSpec = spring(
        dampingRatio = ${type === 'Bouncy' ? '0.7f' : '0.9f'},
        stiffness = ${data.Android.match(/\d+/) ? data.Android.match(/\d+/)[0] + 'f' : 'Spring.StiffnessMedium'}
    )
}`;
}

// State Machine
const STATE = {
    CLOSED: 'closed',
    COLLAPSED: 'collapsed',
    EXPANDED: 'expanded'
};
let currentState = STATE.CLOSED;

// Event Listeners
openBtn.addEventListener('click', () => {
    sheetOverlay.classList.add('open');
    sheetSurface.classList.remove('expanded');
    sheetSurface.classList.add('collapsed');
    currentState = STATE.COLLAPSED;
    sheetSurface.style.transform = '';
});

function closeSheet() {
    sheetOverlay.classList.remove('open');
    sheetSurface.classList.remove('collapsed', 'expanded');
    currentState = STATE.CLOSED;
    sheetSurface.style.transform = '';
}

[closeBtn, footerConfirmBtn].forEach(btn => {
    btn.addEventListener('click', closeSheet);
});

sheetOverlay.addEventListener('click', (e) => {
    if (e.target === sheetOverlay || e.target.classList.contains('sheet-backdrop')) {
        closeSheet();
    }
});

// --- Swipe / Drag Down Logic (Enhanced with Scroll Priority) ---
const sheetBody = document.querySelector('.sheet-body');

let startDragY = 0;
let lastDragY = 0;
let initialScrollTop = 0;
let initialTranslateY = 0;

function startDrag(y, event) {
    // Determine initial offset based on state
    const collapsedY = (window.innerHeight - 58) * 0.5;
    initialTranslateY = (currentState === STATE.COLLAPSED) ? collapsedY : 0;
    initialScrollTop = sheetBody.scrollTop;

    startDragY = y;
    lastDragY = y;
    isDragging = true;
    sheetSurface.style.transition = 'none';
}

function moveDrag(y, event) {
    if (!isDragging) return;

    const deltaY = y - startDragY;
    const collapsedY = (window.innerHeight - 58) * 0.5;

    if (currentState === STATE.COLLAPSED) {
        // In collapsed state, always move the sheet first
        currentY = initialTranslateY + deltaY;

        // Resistance when pulling up past expanded limit
        if (currentY < 0) currentY *= 0.2;

        if (event.cancelable) event.preventDefault();
        sheetSurface.style.transform = `translateY(${currentY}px)`;
    } else {
        // In expanded state: Seamless Scroll -> Resize logic
        if (event.cancelable) event.preventDefault();

        // If we are dragging DOWN (deltaY > 0)
        if (deltaY > 0) {
            const potentialScroll = initialScrollTop - deltaY;
            if (potentialScroll >= 0) {
                // We are still scrolling the content
                sheetBody.scrollTop = potentialScroll;
                currentY = 0;
                sheetSurface.style.transform = `translateY(0)`;
            } else {
                // We've hit the top, start dragging the sheet down
                currentY = -potentialScroll; // The remainder of the drag
                sheetSurface.style.transform = `translateY(${currentY}px)`;
            }
        }
        // If we are dragging UP (deltaY < 0)
        else {
            if (currentY > 0) {
                // Pulling the sheet back up to expanded position
                currentY = Math.max(0, initialTranslateY + deltaY);
                sheetSurface.style.transform = `translateY(${currentY}px)`;
            } else {
                // Sheet is at top, start scrolling content
                sheetBody.scrollTop = initialScrollTop - deltaY;
                currentY = 0;
                sheetSurface.style.transform = `translateY(0)`;
            }
        }
    }
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    sheetSurface.style.transition = '';

    const collapsedY = (window.innerHeight - 58) * 0.5;
    const threshold = 100;

    if (currentState === STATE.COLLAPSED) {
        if (currentY < collapsedY - threshold) {
            sheetSurface.classList.replace('collapsed', 'expanded');
            currentState = STATE.EXPANDED;
            sheetSurface.style.transform = '';
        } else if (currentY > collapsedY + threshold) {
            closeSheet();
        } else {
            sheetSurface.style.transform = '';
        }
    } else {
        // From Expanded state
        if (currentY > threshold) {
            sheetSurface.classList.replace('expanded', 'collapsed');
            currentState = STATE.COLLAPSED;
            sheetSurface.style.transform = '';
        } else {
            sheetSurface.style.transform = '';
        }
    }
    currentY = 0;
}

// Global surface listeners (Touch)
sheetSurface.addEventListener('touchstart', (e) => {
    startDrag(e.touches[0].clientY, e);
}, { passive: false });

sheetSurface.addEventListener('touchmove', (e) => {
    moveDrag(e.touches[0].clientY, e);
}, { passive: false });

sheetSurface.addEventListener('touchend', endDrag);

// Global surface listeners (Mouse)
sheetSurface.addEventListener('mousedown', (e) => {
    // Don't start drag if clicking interactive elements like buttons
    if (e.target.closest('button') || e.target.closest('select')) return;

    startDrag(e.clientY);

    const onMouseMove = (me) => moveDrag(me.clientY, me);
    const onMouseUp = () => {
        endDrag();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
});

motionSelect.addEventListener('change', (e) => {
    const [type, speed] = e.target.value.split('.');
    currentMotion = { type, speed };
    updateTokens(type, speed);
});

// Tab Switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.code-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`code-${tab.dataset.target}`).classList.add('active');
    });
});

// --- Trackpad / Wheel Support ---
let wheelY = 0;
let isWheelActive = false;

sheetSurface.addEventListener('wheel', (e) => {
    // If we are at the top and the user 'swipes down' with trackpad (deltaY < 0 in traditional wheel/mouse)
    // Note: Trackpad deltaY direction can vary, but usually deltaY < 0 is 'pulling content down' (scrolling up)
    if (sheetBody.scrollTop <= 0 && e.deltaY < 0 && currentState === STATE.EXPANDED) {
        if (e.cancelable) e.preventDefault();

        // Move sheet down slightly with wheel to indicate gesture
        wheelY -= e.deltaY;
        if (wheelY > 100) {
            sheetSurface.classList.replace('expanded', 'collapsed');
            currentState = STATE.COLLAPSED;
            wheelY = 0;
        } else {
            sheetSurface.style.transition = 'none';
            sheetSurface.style.transform = `translateY(${wheelY}px)`;

            clearTimeout(window.wheelTimer);
            window.wheelTimer = setTimeout(() => {
                sheetSurface.style.transition = '';
                sheetSurface.style.transform = '';
                wheelY = 0;
            }, 100);
        }
    }
}, { passive: false });

// --- View Toggling Logic ---
const navItems = document.querySelectorAll('.nav-item');
const views = {
    sheet: {
        container: document.getElementById('view-sheet'),
        actions: document.getElementById('sheet-actions')
    },
    stepper: {
        container: document.getElementById('view-stepper'),
        actions: document.getElementById('stepper-actions')
    },
    'page-indicator': {
        container: document.getElementById('view-page-indicator'),
        actions: document.getElementById('page-indicator-actions')
    }
};

function switchView(targetView) {
    if (!views[targetView]) return;

    // Save to localStorage
    localStorage.setItem('activeView', targetView);

    // Update Nav UI
    navItems.forEach(nav => {
        if (nav.getAttribute('data-view') === targetView) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    // Toggle Views
    Object.keys(views).forEach(key => {
        if (key === targetView) {
            views[key].container.classList.remove('hidden');
            views[key].actions.classList.remove('hidden');
        } else {
            views[key].container.classList.add('hidden');
            views[key].actions.classList.add('hidden');
        }
    });
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-view');
        switchView(targetView);
    });
});

// --- Stepper Logic ---
function initSteppers() {
    document.querySelectorAll('.stepper-container').forEach(container => {
        // Avoid double-initialization
        if (container.dataset.initialized) return;
        container.dataset.initialized = "true";

        const initialBtn = container.querySelector('.add-initial-btn');
        const plusBtn = container.querySelector('.plus');
        const minusBtn = container.querySelector('.minus');
        const countSpan = container.querySelector('.step-count');

        let count = container.classList.contains('active') ? parseInt(countSpan.textContent) : 0;

        const updateUI = () => {
            countSpan.textContent = count;
            if (count > 0) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        };

        initialBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (count === 0) {
                count = 1;
            } else {
                count++;
            }
            updateUI();
        });

        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            count++;
            updateUI();
        });

        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            count--;
            if (count < 0) count = 0;
            updateUI();
        });
    });
}

initSteppers();

// --- Page Indicator Logic ---
function initPageIndicators() {
    let currentIndex = 0;
    const totalSteps = 5;
    const dotContainers = document.querySelectorAll('.indicator-container');
    const nextBtn = document.getElementById('nextIndicatorBtn');
    const prevBtn = document.getElementById('prevIndicatorBtn');
    // Multi-instance buttons
    const playPauseBtns = document.querySelectorAll('.play-pause-btn');

    let isLooping = false;

    function updateIndicators(nextIndex) {
        if (isLooping) return;

        let displayIndex = nextIndex; // The index for dots (0-4)
        let visualIndex = nextIndex;  // The index for the image strip (0-5)

        // Seamless Loop Logic (Forward: 4 -> 0)
        const isForwardLoop = currentIndex === totalSteps - 1 && nextIndex === 0;

        if (isForwardLoop) {
            visualIndex = totalSteps; // Move to the clone (index 5)
            isLooping = true;
        }

        dotContainers.forEach(container => {
            const card = container.closest('.product-card-v2');
            if (!card) return;

            const type = container.dataset.type;
            const strip = card.querySelector('.panning-strip');

            if (strip) {
                const offset = visualIndex * (100 / 6);
                strip.style.transform = `translateX(-${offset}%)`;

                if (isForwardLoop) {
                    // After the 400ms transition to the clone, snap back to index 0
                    setTimeout(() => {
                        strip.style.transition = 'none';
                        strip.style.transform = `translateX(0%)`;
                        // Force reflow
                        strip.offsetHeight;
                        strip.style.transition = '';
                        isLooping = false;
                    }, 350); // Matches --motion-duration (0.334s)
                }
            }

            // Indicator dots and other UI elements always use displayIndex (0-4)
            if (type === 'dot' || type === 'pill-container' || type === 'floating-pill' || type === 'play-pause' || type === 'separated-indicators') {
                const dots = container.querySelectorAll('.dot');
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === displayIndex);
                    if (i !== displayIndex) {
                        const fill = dot.querySelector('.dot-fill');
                        if (fill) fill.style.removeProperty('--progress');
                        dot.style.removeProperty('--progress');
                    }
                });

                if (type === 'play-pause') {
                    const btn = container.querySelector('.play-pause-btn');
                    const track = container.querySelector('.dot-track');
                    if (btn && track) {
                        if (displayIndex === dots.length - 1) {
                            track.appendChild(btn);
                        } else {
                            track.insertBefore(btn, dots[displayIndex + 1]);
                        }
                    }
                }
            }

            if (type === 'sliding-bar') {
                const segments = container.querySelectorAll('.bar-segment');
                segments.forEach((seg, i) => {
                    seg.classList.toggle('filled', i < displayIndex);
                    seg.classList.toggle('active', i === displayIndex);
                    if (i !== displayIndex) {
                        const bar = seg.querySelector('.bar-active');
                        if (bar) bar.style.removeProperty('--progress');
                    }
                });
            }

            if (type === 'numeric-badge') {
                container.querySelector('.current').textContent = displayIndex + 1;
            }
        });

        currentIndex = displayIndex;
        resetAutoPlay();
    }

    nextBtn.addEventListener('click', () => {
        updateIndicators((currentIndex + 1) % totalSteps);
    });

    prevBtn.addEventListener('click', () => {
        updateIndicators(currentIndex > 0 ? currentIndex - 1 : totalSteps - 1);
    });

    playPauseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAutoPlay();
        });
    });

    // --- Drag / Swipe Implementation ---
    const visualAreas = document.querySelectorAll('.product-visual');
    let dragStartX = 0;
    let isDraggingIndicator = false;
    let wasAutoPlayActiveBeforeDrag = true;

    function handleStart(x) {
        dragStartX = x;
        isDraggingIndicator = true;
        wasAutoPlayActiveBeforeDrag = autoPlayActive;
        if (autoPlayActive) {
            toggleAutoPlay(false, true); // Silent pause
        }
    }

    function handleEnd(x) {
        if (!isDraggingIndicator) return;
        const deltaX = x - dragStartX;
        const threshold = 50;

        if (deltaX > threshold) {
            updateIndicators(currentIndex > 0 ? currentIndex - 1 : totalSteps - 1);
        } else if (deltaX < -threshold) {
            updateIndicators((currentIndex + 1) % totalSteps);
        }

        isDraggingIndicator = false;
        if (wasAutoPlayActiveBeforeDrag) {
            toggleAutoPlay(true, true); // Silent resume
        }
    }

    visualAreas.forEach(area => {
        area.addEventListener('mousedown', (e) => handleStart(e.clientX));
        window.addEventListener('mouseup', (e) => handleEnd(e.clientX));
        area.addEventListener('touchstart', (e) => handleStart(e.touches[0].clientX), { passive: true });
        area.addEventListener('touchend', (e) => handleEnd(e.changedTouches[0].clientX), { passive: true });
    });

    // --- Auto-play Implementation ---
    const AUTO_PLAY_INTERVAL = 4000;
    let lastPageChangeTime = Date.now();
    let pausedElapsed = 0;
    let autoPlayActive = true;

    function toggleAutoPlay(forceState, isSilent = false) {
        const nextState = forceState !== undefined ? forceState : !autoPlayActive;
        if (nextState === autoPlayActive) return;

        if (!nextState) {
            // Pausing
            pausedElapsed = Date.now() - lastPageChangeTime;
            if (!isSilent) {
                playPauseBtns.forEach(btn => {
                    btn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"></path>
                        </svg>`;
                });
            }
        } else {
            // Resuming
            lastPageChangeTime = Date.now() - pausedElapsed;
            if (!isSilent) {
                playPauseBtns.forEach(btn => {
                    btn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>`;
                });
            }
        }
        autoPlayActive = nextState;
    }

    function tick() {
        if (!autoPlayActive) {
            requestAnimationFrame(tick);
            return;
        }

        const now = Date.now();
        const elapsed = now - lastPageChangeTime;
        const progress = Math.min(elapsed / AUTO_PLAY_INTERVAL, 1);

        document.querySelectorAll('.dot.active, .dot.active .dot-fill, .bar-segment.active .bar-active').forEach(el => {
            el.style.setProperty('--progress', progress);
        });

        if (progress >= 1) {
            updateIndicators((currentIndex + 1) % totalSteps);
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    function resetAutoPlay() {
        lastPageChangeTime = Date.now();
        pausedElapsed = 0;
    }

    // Set initial visible state for all (demo style)
    dotContainers.forEach(c => c.classList.add('visible'));

    // Ensure first dot placement and state is locked in on load
    updateIndicators(0);
}

initPageIndicators();

// Prevent browser default text selection/dragging which interferes with our gestures
sheetSurface.addEventListener('dragstart', (e) => e.preventDefault());
sheetSurface.addEventListener('selectstart', (e) => e.preventDefault());

// Restore previous view after all initializations
document.addEventListener('DOMContentLoaded', () => {
    const savedView = localStorage.getItem('activeView');
    if (savedView && views[savedView]) {
        switchView(savedView);
    }
});
