
// Import tokens (simulated here since we can't fetch local files easily in vanilla JS without a server, 
// I will embed the data structure for the demo logic)
// In a real build, this would import 'tokens.json'
// --- New Motion Spec (Spring) ---
const BOUNCE = {
    SMOOTH: 0,
    SNAPPY: 0.15,
    BOUNCY: 0.3
};

const DURATION = {
    FASTEST: 0.167,
    FAST: 0.251,
    DEFAULT: 0.334,
    SLOW: 0.668
};

const SPRING = {
    FASTEST_SMOOTH: { type: 'spring', duration: DURATION.FASTEST, bounce: BOUNCE.SMOOTH },
    FAST_SMOOTH: { type: 'spring', duration: DURATION.FAST, bounce: BOUNCE.SMOOTH },
    DEFAULT_SMOOTH: { type: 'spring', duration: DURATION.DEFAULT, bounce: BOUNCE.SMOOTH },
    SLOW_SMOOTH: { type: 'spring', duration: DURATION.SLOW, bounce: BOUNCE.SMOOTH },
    FASTEST_SNAPPY: { type: 'spring', duration: DURATION.FASTEST, bounce: BOUNCE.SNAPPY },
    FAST_SNAPPY: { type: 'spring', duration: DURATION.FAST, bounce: BOUNCE.SNAPPY },
    DEFAULT_SNAPPY: { type: 'spring', duration: DURATION.DEFAULT, bounce: BOUNCE.SNAPPY },
    SLOW_SNAPPY: { type: 'spring', duration: DURATION.SLOW, bounce: BOUNCE.SNAPPY },
    FASTEST_BOUNCY: { type: 'spring', duration: DURATION.FASTEST, bounce: BOUNCE.BOUNCY },
    FAST_BOUNCY: { type: 'spring', duration: DURATION.FAST, bounce: BOUNCE.BOUNCY },
    DEFAULT_BOUNCY: { type: 'spring', duration: DURATION.DEFAULT, bounce: BOUNCE.BOUNCY },
    SLOW_BOUNCY: { type: 'spring', duration: DURATION.SLOW, bounce: BOUNCE.BOUNCY },
};

// State mapping for existing UI
const tokens = {
    Motion: {
        Smooth: {
            Fastest: { Web: SPRING.FASTEST_SMOOTH, iOS: "167ms / 0", Android: "Stiff: 1455" },
            Fast: { Web: SPRING.FAST_SMOOTH, iOS: "251ms / 0", Android: "Stiff: 627" },
            Default: { Web: SPRING.DEFAULT_SMOOTH, iOS: "334ms / 0", Android: "Stiff: 384" },
            Slow: { Web: SPRING.SLOW_SMOOTH, iOS: "668ms / 0", Android: "Stiff: 100" }
        },
        Snappy: {
            Fastest: { Web: SPRING.FASTEST_SNAPPY, iOS: "167ms / 0.15", Android: "Stiff: 1455, Dump: 0.9" },
            Fast: { Web: SPRING.FAST_SNAPPY, iOS: "251ms / 0.15", Android: "Stiff: 627, Dump: 0.9" },
            Default: { Web: SPRING.DEFAULT_SNAPPY, iOS: "334ms / 0.15", Android: "Stiff: 384, Dump: 0.9" },
            Slow: { Web: SPRING.SLOW_SNAPPY, iOS: "668ms / 0.15", Android: "Stiff: 100, Dump: 0.9" }
        },
        Bouncy: {
            Fastest: { Web: SPRING.FASTEST_BOUNCY, iOS: "167ms / 0.3", Android: "Stiff: 1455, Dump: 0.7" },
            Fast: { Web: SPRING.FAST_BOUNCY, iOS: "251ms / 0.3", Android: "Stiff: 627, Dump: 0.7" },
            Default: { Web: SPRING.DEFAULT_BOUNCY, iOS: "334ms / 0.3", Android: "Stiff: 384, Dump: 0.7" },
            Slow: { Web: SPRING.SLOW_BOUNCY, iOS: "668ms / 0.3", Android: "Stiff: 100, Dump: 0.7" }
        }
    }
};

const { animate } = Motion; // Destructure Motion library

const sheetOverlay = document.getElementById('sheetOverlay');
const sheetSurface = document.getElementById('sheetSurface');
const openBtn = document.getElementById('openSheetBtn');
const closeBtn = document.getElementById('headerCloseBtn');
const footerConfirmBtn = document.getElementById('footerConfirmBtn');
const typeBtns = document.querySelectorAll('#typeSelector .selector-btn');
const speedBtns = document.querySelectorAll('#speedSelector .selector-btn');
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
    if (!data) return;

    // Update CSS variables for fallbacks or simple bits
    root.style.setProperty('--motion-duration', `${data.Web.duration}s`);
    // Note: Easing doesn't apply to pure spring, but we keep it for CSS fallbacks
    root.style.setProperty('--motion-easing', 'cubic-bezier(0.2, 0.8, 0.2, 1)'); 

    // Update Spec Labels
    if (valWebDur) valWebDur.textContent = `${data.Web.duration}s`;
    if (valIOS) valIOS.textContent = `${data.iOS}`;
    if (valAndroid) valAndroid.textContent = `${data.Android}`;

    // Update Code Snippets
    updateCodeSnippets(type, speed, data);
}

function getSpring() {
    return tokens.Motion[currentMotion.type][currentMotion.speed].Web;
}

function getMotionSpec() {
    const data = tokens.Motion[currentMotion.type][currentMotion.speed];
    return {
        type: 'spring',
        duration: data.Web.duration,
        bounce: data.Web.bounce
    };
}

// Initial Call
updateTokens('Smooth', 'Default');

function updateCodeSnippets(type, speed, data) {
    const variantName = `Motion.${type}.${speed}`;

    // Web Implementation
    if (codeWeb) {
        codeWeb.textContent = `// Motion One (motion.dev) Implementation
const SPRING = {
  type: 'spring',
  duration: ${data.Web.duration},
  bounce: ${data.Web.bounce}
};

// Usage Example
animate("#element", { y: [100, 0] }, SPRING);`;
    }

    // SwiftUI Implementation
    if (codeSwift) {
        codeSwift.textContent = `// SwiftUI Animation Spec
// Using Design Token: ${variantName}

extension Animation {
    static let dsSpring = Animation.spring(
        duration: ${data.Web.duration},
        bounce: ${data.Web.bounce}
    )
}`;
    }

    // Jetpack Compose Implementation
    if (codeCompose) {
        codeCompose.textContent = `// Jetpack Compose Animation Spec
// Using Design Token: ${variantName}

val DSSpringSpec = spring<Float>(
    dampingRatio = ${data.Web.bounce === 0.3 ? '0.7f' : (data.Web.bounce === 0.15 ? '0.85f' : 'Spring.DampingRatioNoBouncy')},
    stiffness = ${data.Web.visualDuration === 0.167 ? '1500f' : (data.Web.visualDuration === 0.334 ? '384f' : '100f')}
)`;
    }
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
    
    const collapsedY = (window.innerHeight - 58) * 0.5;
    animate(sheetSurface, { y: [window.innerHeight, collapsedY], opacity: 1 }, getSpring());
    animate(sheetFooter, { y: [100, 0] }, getSpring()); // ENTER FOOTER
    animate(sheetOverlay.querySelector('.sheet-backdrop'), { opacity: [0, 1] }, { duration: 0.3 });
});

function closeSheet() {
    animate(sheetSurface, { y: window.innerHeight, opacity: 0 }, getSpring()).then(() => {
        sheetOverlay.classList.remove('open');
        sheetSurface.classList.remove('collapsed', 'expanded');
        currentState = STATE.CLOSED;
        sheetSurface.style.transform = '';
        sheetFooter.style.transform = '';
    });
    animate(sheetFooter, { y: 100 }, getSpring()); // EXIT FOOTER
    animate(sheetOverlay.querySelector('.sheet-backdrop'), { opacity: 0 }, { duration: 0.3 });

    // Reset scroll position
    setTimeout(() => {
        if (sheetBody) sheetBody.scrollTop = 0;
    }, 500); 
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
        animate(sheetSurface, { y: currentY }, { duration: 0 });
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
                animate(sheetSurface, { y: currentY }, { duration: 0 });
            }
        }
        // If we are dragging UP (deltaY < 0)
        else {
            if (currentY > 0) {
                // Pulling the sheet back up to expanded position
                currentY = Math.max(0, initialTranslateY + deltaY);
                animate(sheetSurface, { y: currentY }, { duration: 0 });
            } else {
                // Sheet is at top, start scrolling content
                sheetBody.scrollTop = initialScrollTop - deltaY;
                currentY = 0;
                animate(sheetSurface, { y: 0 }, { duration: 0 });
            }
        }
    }
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    
    const collapsedY = (window.innerHeight - 58) * 0.5;
    const threshold = 100;

    if (currentState === STATE.COLLAPSED) {
        if (currentY < collapsedY - threshold) {
            // Snap to Expanded
            animate(sheetSurface, { y: 0 }, getSpring());
            sheetSurface.classList.replace('collapsed', 'expanded');
            currentState = STATE.EXPANDED;
        } else if (currentY > collapsedY + threshold) {
            // Close
            closeSheet();
        } else {
            // Return to Collapsed
            animate(sheetSurface, { y: collapsedY }, getSpring());
        }
    } else {
        // From Expanded state
        if (currentY > threshold) {
            // Snap to Collapsed
            animate(sheetSurface, { y: collapsedY }, getSpring());
            sheetSurface.classList.replace('expanded', 'collapsed');
            currentState = STATE.COLLAPSED;
        } else {
            // Return to Expanded
            animate(sheetSurface, { y: 0 }, getSpring());
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

typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMotion.type = btn.dataset.type;
        updateTokens(currentMotion.type, currentMotion.speed);
    });
});

speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMotion.speed = btn.dataset.speed;
        updateTokens(currentMotion.type, currentMotion.speed);
    });
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
const subNavItems = document.querySelectorAll('.sub-nav-item');
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
    },
    'dialog-alert': {
        container: document.getElementById('view-dialog-alert'),
        actions: document.getElementById('dialog-alert-actions')
    }
};

function filterPageIndicators(category) {
    const elements = document.querySelectorAll('#view-page-indicator [data-category]');
    elements.forEach(el => {
        if (!category || el.dataset.category === category) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });

    // Update sub-nav active state
    subNavItems.forEach(sub => {
        if (sub.dataset.category === category) {
            sub.classList.add('active');
        } else {
            sub.classList.remove('active');
        }
    });
}

function switchView(targetView, subCategory = null) {
    if (!views[targetView]) return;

    // Save to localStorage
    localStorage.setItem('activeView', targetView);
    localStorage.setItem('activeSubCategory', subCategory || '');

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

    // Toggle Motion Controls Disability
    const typeSelector = document.getElementById('typeSelector');
    const speedSelector = document.getElementById('speedSelector');
    const specsArea = document.querySelector('.specs');
    
    if (targetView === 'dialog-alert') {
        typeSelector?.classList.add('disabled');
        speedSelector?.classList.add('disabled');
        specsArea?.classList.add('disabled');
    } else {
        typeSelector?.classList.remove('disabled');
        speedSelector?.classList.remove('disabled');
        specsArea?.classList.remove('disabled');
    }

    // Toggle Main Actions Group Visibility
    const mainActionsGroup = document.getElementById('mainActionsGroup');
    if (mainActionsGroup) {
        const activeAction = views[targetView].actions;
        const hasButtons = activeAction.querySelector('button') !== null;
        if (hasButtons) {
            mainActionsGroup.classList.remove('hidden');
        } else {
            mainActionsGroup.classList.add('hidden');
        }
    }

    // Handle Page Indicator filtering and animations
    if (targetView === 'page-indicator') {
        filterPageIndicators(subCategory);

        // Trigger entry animations for Numeric New variant
        const animatedIndicators = document.querySelectorAll('.type-numeric-new');
        animatedIndicators.forEach(el => {
            el.classList.remove('is-animated');
            // Force reflow
            void el.offsetWidth;
            setTimeout(() => {
                el.classList.add('is-animated');
            }, 1500); // Increased delay so user sees it expanded first
        });
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-view');
        switchView(targetView);
    });
});

subNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = item.getAttribute('data-category');
        switchView('page-indicator', category);
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

        const updateUI = (isEntering = false) => {
            const spec = getSpring();
            countSpan.textContent = count;
            
            const is160 = container.closest('.product-card').classList.contains('size-160');
            const isBorder = container.closest('.product-card').classList.contains('border-variant');
            
            if (count > 0) {
                if (!container.classList.contains('active')) {
                    const targetWidth = is160 ? 140 : 95;
                    // Provide explicit start for the spring to track correctly
                    animate(container, { width: ['38px', `${targetWidth}px`] }, spec);
                    container.classList.add('active');
                    
                    const btnActivePos = isBorder ? 5 : 6;
                    animate(initialBtn, { 
                        width: ['38px', '26px'], 
                        height: ['38px', '26px'], 
                        top: [isBorder ? '-1px' : '0px', `${btnActivePos}px`], 
                        right: [isBorder ? '-1px' : '0px', `${btnActivePos}px`],
                        backgroundSize: ['24px 24px', '18px 18px'],
                        opacity: [1, 1],
                        scale: [1, 1]
                    }, spec);
                    
                    animate(minusBtn, { opacity: [0, 1], scale: [0.8, 1] }, spec);
                    animate(countSpan, { opacity: [0, 1], scale: [0.8, 1] }, spec);
                }
            } else {
                if (container.classList.contains('active')) {
                    const targetWidth = is160 ? 140 : 95;
                    animate(container, { width: [`${targetWidth}px`, '38px'] }, spec);
                    container.classList.remove('active');
                    
                    const btnInactivePos = isBorder ? -1 : 0;
                    animate(initialBtn, { 
                        width: ['26px', '38px'], 
                        height: ['26px', '38px'], 
                        top: [`${isBorder ? 5 : 6}px`, `${btnInactivePos}px`], 
                        right: [`${isBorder ? 5 : 6}px`, `${btnInactivePos}px`],
                        backgroundSize: ['18px 18px', '24px 24px'],
                        opacity: [1, 1],
                        scale: [1, 1]
                    }, spec);
                    
                    animate(minusBtn, { opacity: 0, scale: 0.8 }, spec);
                    animate(countSpan, { opacity: 0, scale: 0.8 }, spec);
                }
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
                const images = strip.querySelectorAll('img');
                const count = images.length; // Includes clone
                const cardSteps = count - 1;

                // We need to adjust visualIndex if the card has a different number of steps
                let cardVisualIndex = visualIndex;
                let cardIsForwardLoop = isForwardLoop;

                // If this specific card has fewer steps, we wrap its index
                const localDisplayIndex = displayIndex % cardSteps;

                // For the offset calculation, we need to know the specific percentage for this card
                const stepWidthPercent = 100 / count;

                // Determine the correct visual index for THIS card
                let localVisualIndex = visualIndex;
                if (visualIndex >= cardSteps) {
                    if (currentIndex % cardSteps === cardSteps - 1 && nextIndex % cardSteps === 0) {
                        localVisualIndex = cardSteps;
                    } else {
                        localVisualIndex = visualIndex % cardSteps;
                    }
                }

                const offset = localVisualIndex * stepWidthPercent;
                
                if (card.dataset.type === 'sliding-bar') {
                    // Instant swap for sliding bar
                    animate(strip, { x: `-${offset}%` }, { duration: 0 });
                } else {
                    // Spring snap for others
                    const snapAnim = animate(strip, { x: `-${offset}%` }, getSpring());
                    
                    // Seamless loop: if we just animated to the clone, jump back to real index 0
                    if (localVisualIndex === cardSteps && nextIndex % cardSteps === 0) {
                        snapAnim.then(() => {
                            animate(strip, { x: '0%' }, { duration: 0 });
                            isLooping = false;
                        });
                    }
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
                    // Fixed position on left, no logic needed here
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

            if (type === 'numeric-badge' || type === 'numeric-new') {
                const strip = card.querySelector('.panning-strip');
                const cardSteps = strip ? strip.querySelectorAll('img').length - 1 : totalSteps;
                container.querySelector('.current').textContent = (displayIndex % cardSteps) + 1;
                const totalEl = container.querySelector('.total');
                if (totalEl) totalEl.textContent = cardSteps;
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
    let dragContainerWidth = 0;

    function handleStart(x, area) {
        dragStartX = x;
        isDraggingIndicator = true;
        dragContainerWidth = area.offsetWidth;
        wasAutoPlayActiveBeforeDrag = autoPlayActive;
        if (autoPlayActive) {
            toggleAutoPlay(false, true); // Silent pause
        }

        // Stop any active animations and disable transitions
        document.querySelectorAll('.panning-strip').forEach(s => {
            s.style.transition = 'none';
            // We set transform directly now
        });
    }

    function handleMove(x) {
        if (!isDraggingIndicator) return;
        const deltaX = x - dragStartX;
        
        document.querySelectorAll('.panning-strip').forEach(strip => {
            const imgCount = strip.querySelectorAll('img').length;
            const stepWidthPercentOfStrip = 100 / imgCount;
            const currentOffset = -currentIndex * stepWidthPercentOfStrip + (deltaX / dragContainerWidth) * stepWidthPercentOfStrip;
            
            // USE animate with duration 0 to "drive" the property without competition
            animate(strip, { x: `${currentOffset}%` }, { duration: 0 });
        });
    }

    function handleEnd(x) {
        if (!isDraggingIndicator) return;
        const deltaX = x - dragStartX;
        const threshold = dragContainerWidth * 0.2; // 20% of width to trigger change

        // Re-enable transitions for non-animated types, but for panning-strip we primarily use animate()
        document.querySelectorAll('.panning-strip').forEach(s => {
            // No need to set transition back if we use animate() for the snap
            s.style.transition = 'none'; 
        });

        let nextIndex = currentIndex;
        if (deltaX > threshold) {
            // Swipe Right -> Prev
            nextIndex = (currentIndex > 0) ? currentIndex - 1 : totalSteps - 1;
        } else if (deltaX < -threshold) {
            // Swipe Left -> Next
            nextIndex = (currentIndex + 1) % totalSteps;
        }

        updateIndicators(nextIndex);

        isDraggingIndicator = false;
        if (wasAutoPlayActiveBeforeDrag) {
            toggleAutoPlay(true, true); // Silent resume
        }
    }

    window.addEventListener('mousemove', (e) => handleMove(e.clientX));
    window.addEventListener('mouseup', (e) => handleEnd(e.clientX));

    visualAreas.forEach(area => {
        area.addEventListener('mousedown', (e) => handleStart(e.clientX, area));
        
        area.addEventListener('touchstart', (e) => handleStart(e.touches[0].clientX, area), { passive: true });
        area.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX), { passive: true });
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

// --- Collapsible Specs Logic ---
const specsToggle = document.getElementById('specsToggle');
const specsCollapsible = document.getElementById('specsCollapsible');

if (specsToggle && specsCollapsible) {
    specsToggle.addEventListener('click', () => {
        specsCollapsible.classList.toggle('expanded');
    });
}

// Restore previous view after all initializations
document.addEventListener('DOMContentLoaded', () => {
    const savedView = localStorage.getItem('activeView');
    const savedSubCategory = localStorage.getItem('activeSubCategory');
    if (savedView && views[savedView]) {
        switchView(savedView, savedSubCategory);
    }
});

// --- Dialog / Alert Logic ---
function initDialogAlert() {
    const variantTabs = document.querySelectorAll('.variant-tab');
    const dialogPreviewBox = document.getElementById('dialogPreviewBox');
    const dialogLayer = document.getElementById('dialogLayer');
    const dialogScrim = document.getElementById('dialogScrim');
    const dialogContainer = document.getElementById('dialogContainer');
    const dialogTopRegular = document.getElementById('dialogTopRegular');
    const dialogTopE = document.getElementById('dialogTopE');
    const dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
    const dialogSpecsBox = document.getElementById('dialogSpecsBox');

    let currentVariant = 'A';

    const variantData = {
        'A': {
            memo: '중앙 scale 등장<br>버튼 scale 피드백',
            enter: 'DEFAULT_BOUNCY<br>Opacity 0 → 1<br>Scale 0.6 → 1',
            enterSpring: SPRING.DEFAULT_BOUNCY,
            reveal: null,
            press: 'FAST_SNAPPY<br>Scale 1 → 0.97 (Button)',
            pressSpring: SPRING.FAST_SNAPPY
        },
        'B': {
            memo: '얌전 등장<br>버튼 scale 피드백',
            enter: 'FAST_BOUNCY<br>Opacity 0 → 1<br>Scale 0.96 → 1',
            enterSpring: SPRING.FAST_BOUNCY,
            reveal: null,
            press: 'FAST_SNAPPY<br>Scale 1 → 0.97 (Button)',
            pressSpring: SPRING.FAST_SNAPPY
        },
        'C': {
            memo: '아래쪽에서 펼쳐지면서 등장 (바텀시트처럼)<br>Dialog 전체가 눌리는 느낌 피드백',
            enter: 'FAST_BOUNCY<br>Opacity 0 → 1<br>Scale 0.85 → 1<br>Scale Y 0 → 1<br>Y 450 → 0',
            enterSpring: SPRING.FAST_BOUNCY,
            reveal: 'Delay 334ms<br>Opacity 0 → 1',
            revealSpring: SPRING.DEFAULT_SMOOTH,
            press: 'FAST_SNAPPY<br>Scale 1 → 0.97 (Dialog Container)',
            pressSpring: SPRING.FAST_SNAPPY
        },
        'D': {
            memo: '얌전 등장<br>버튼 scale 피드백<br>컨텐츠가 늦게 나타남',
            enter: 'FAST_BOUNCY<br>Opacity 0 → 1<br>Scale 0.96 → 1',
            enterSpring: SPRING.FAST_BOUNCY,
            reveal: 'Delay 300ms<br>FAST_SNAPPY<br>Opacity 0 → 1',
            revealSpring: SPRING.FAST_SNAPPY,
            press: 'FAST_SNAPPY<br>Scale 1 → 0.97 (Button)',
            pressSpring: SPRING.FAST_SNAPPY
        },
        'E': {
            memo: '얌전 등장<br>버튼 scale 피드백<br>컨텐츠가 늦게 나타남',
            enter: 'FAST_BOUNCY<br>Opacity 0 → 1<br>Scale 0.96 → 1',
            enterSpring: SPRING.FAST_BOUNCY,
            reveal: 'Delay 300ms<br>FAST_SNAPPY<br>Opacity 0 → 1',
            revealSpring: SPRING.FAST_SNAPPY,
            press: 'FAST_SNAPPY<br>Scale 1 → 0.97 (Button)',
            pressSpring: SPRING.FAST_SNAPPY
        },
        'F': {
            memo: '얌전 등장<br>버튼 scale 피드백<br>컨텐츠가 늦게 나타남 (Y position 모션 포함)',
            enter: 'DEFAULT_BOUNCY<br>Opacity 0 → 1<br>Scale 0.8 → 1',
            enterSpring: SPRING.DEFAULT_BOUNCY,
            reveal: 'Delay 100ms<br>SLOW_SNAPPY<br>Opacity 0 → 1<br>Y 8 → 0',
            revealSpring: SPRING.SLOW_SNAPPY,
            press: 'FAST_SNAPPY<br>Scale 1 → 0.97 (Button)',
            pressSpring: SPRING.FAST_SNAPPY
        }
    };

    function updateSpecs(v) {
        const d = variantData[v];
        let html = `
            <div class="spec-group">
                <p style="color: #666; font-size: 12px; font-weight: 500; margin-bottom: 8px;">Variant ${v}</p>
                <div style="white-space: pre-line; color: #111; font-size: 14px;">${d.memo}</div>
            </div>
        `;
        
        if (d.press) {
            html += `<div class="spec-group"><h4>Button / Press Motion</h4><p style="white-space: pre-line;">${d.press}</p></div>`;
        }
        
        html += `<div class="spec-group"><h4>Dialog Enter Motion</h4><p style="white-space: pre-line;">${d.enter}</p></div>`;
        
        if (d.reveal) {
            html += `<div class="spec-group"><h4>Content Reveal</h4><p style="white-space: pre-line;">${d.reveal}</p></div>`;
        }

        const exitScale = v === 'F' ? '0.90' : '0.96';
        html += `<div class="spec-group"><h4>Dialog Exit Motion</h4><p>FAST_SNAPPY<br>Opacity 1 → 0<br>Scale 1 → ${exitScale}</p></div>`;
        html += `<div class="spec-group"><h4>Scrim Motion</h4><p>DEFAULT_BOUNCY<br>Opacity 0 → 1</p></div>`;
        
        dialogSpecsBox.innerHTML = html;
    }

    function setVariant(v) {
        currentVariant = v;
        variantTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.variant === v));
        
        // Ensure closed state before swapping variant classes to prevent glitchy jumps
        dialogLayer.classList.remove('open');
        setTimeout(() => {
            dialogContainer.className = 'dialog-container variant-' + v;
            if (v === 'E') {
                dialogTopRegular.classList.add('hidden');
                dialogTopE.classList.remove('hidden');
            } else {
                dialogTopRegular.classList.remove('hidden');
                dialogTopE.classList.add('hidden');
            }
            updateSpecs(v);
        }, 300); // wait for exit animation to finish before swapping base class
    }

    variantTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (currentVariant !== tab.dataset.variant) {
                setVariant(tab.dataset.variant);
            }
        });
    });

    let isAnimatingDialog = false;

    dialogPreviewBox.addEventListener('click', (e) => {
        // Prevent opening if clicking confirm or while already open/closing
        if (e.target.closest('#dialogConfirmBtn') || isAnimatingDialog) return;
        
        if (!dialogLayer.classList.contains('open')) {
            isAnimatingDialog = true;
            dialogLayer.classList.add('open');
            const d = variantData[currentVariant];
            const enterSpec = d.enterSpring || SPRING.FAST_BOUNCY;
            
            const contentWrapper = document.getElementById('dialogContentWrapper');
            
            // INSTANTLY HIDE OR SHOW CONTENT TO PREVENT FLICKER
            if (['C', 'D', 'E', 'F'].includes(currentVariant)) {
                contentWrapper.style.opacity = '0';
                contentWrapper.style.transform = 'translateY(8px)';
            } else {
                contentWrapper.style.opacity = '1';
                contentWrapper.style.transform = 'none';
            }

            // INSTANTLY RESET CONTAINER TO PREVENT SECOND-OPEN FLICKER
            if (currentVariant === 'C') {
                dialogContainer.style.opacity = '0';
                dialogContainer.style.transform = 'translateY(450px) scale(0.85) scaleY(0.1)';
            } else if (currentVariant === 'A') {
                dialogContainer.style.opacity = '0';
                dialogContainer.style.transform = 'scale(0.6)';
            } else {
                dialogContainer.style.opacity = '0';
                dialogContainer.style.transform = 'scale(0.96)';
            }

            // SPECIFIC ENTRY LOGIC - DO NOT TOUCH D, E, F (Keep their logic conceptually same but more stable)
            if (currentVariant === 'C') {
                // Combine animations to prevent transform property conflict
                animate(dialogContainer, { 
                    y: [450, 0], 
                    scale: [0.85, 1], 
                    scaleY: [0.1, 1],
                    opacity: [0, 1] 
                }, enterSpec);
            } else if (currentVariant === 'A') {
                animate(dialogContainer, { 
                    scale: [0.6, 1], 
                    opacity: [0, 1], 
                    y: [0, 0], 
                    scaleY: [1, 1] 
                }, enterSpec);
            } else if (currentVariant === 'B') {
                animate(dialogContainer, { 
                    scale: [0.96, 1], 
                    opacity: [0, 1], 
                    y: [0, 0], 
                    scaleY: [1, 1] 
                }, enterSpec);
            } else if (currentVariant === 'F') {
                animate(dialogContainer, { scale: [0.8, 1], opacity: [0, 1] }, enterSpec);
            } else {
                animate(dialogContainer, { scale: [0.96, 1], opacity: [0, 1] }, enterSpec);
            }
            
            isAnimatingDialog = false; 

            // Reveal Animation (C, D, E, F)
            if (d.revealSpring) {
                // Sync delay with entry duration to prevent 'lag' feeling
                // enterSpec.duration for C is 0.251 (FAST_BOUNCY)
                const delay = currentVariant === 'C' ? 251 : (currentVariant === 'F' ? 150 : 334); 
                setTimeout(() => {
                    animate(contentWrapper, { opacity: [0, 1], y: [8, 0] }, d.revealSpring);
                }, delay);
            }

            animate(dialogScrim, { opacity: [0, 1] }, { duration: 0.3 });
        }
    });

    const closeDialog = () => {
        if (isAnimatingDialog || !dialogLayer.classList.contains('open')) return;
        
        isAnimatingDialog = true;
        const spec = SPRING.FAST_SNAPPY; 
        const exitScale = currentVariant === 'F' ? 0.90 : 0.96;
        
        animate(dialogContainer, { 
            scale: exitScale, 
            opacity: 0 
        }, spec).then(() => {
            dialogLayer.classList.remove('open');
            // Full reset
            animate(dialogContainer, { scale: 1, scaleY: 1, opacity: 0, y: 0 }, { duration: 0 });
            const contentWrapper = document.getElementById('dialogContentWrapper');
            animate(contentWrapper, { opacity: 1, y: 0 }, { duration: 0 }); 
            isAnimatingDialog = false;
        });
        animate(dialogScrim, { opacity: 0 }, { duration: 0.2 });
    };

    dialogScrim.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDialog();
    });

    dialogConfirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDialog();
    });

    // Variant-specific pressed state handling
    const handlePressStart = () => {
        const d = variantData[currentVariant];
        if (d && d.pressSpring) {
            if (currentVariant === 'C') {
                // Whole Dialog scales down
                animate(dialogContainer, { scale: 0.97 }, d.pressSpring);
            } else {
                // ONLY the button scales down
                animate(dialogConfirmBtn, { scale: 0.96 }, d.pressSpring);
            }
        }
    };
    const handlePressEnd = () => {
        const d = variantData[currentVariant];
        if (d && d.pressSpring) {
            if (currentVariant === 'C') {
                animate(dialogContainer, { scale: 1 }, d.pressSpring);
            } else {
                animate(dialogConfirmBtn, { scale: 1 }, d.pressSpring);
            }
        }
    };

    dialogConfirmBtn.addEventListener('mousedown', handlePressStart);
    dialogConfirmBtn.addEventListener('touchstart', handlePressStart);
    window.addEventListener('mouseup', handlePressEnd);
    window.addEventListener('touchend', handlePressEnd);

    // Init
    setVariant('A');
}

initDialogAlert();

