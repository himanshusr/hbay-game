// Global variable to store joystick input
window.joystickInput = { x: 0, y: 0 };

function setupJoystick() {
    const container = document.getElementById('joystick-container');
    const base = document.getElementById('joystick-base');
    const handle = document.getElementById('joystick-handle');

    // Check if elements exist (they might not on non-touch devices if CSS hides them)
    if (!container || !base || !handle) {
        console.log("Joystick elements not found, likely not a touch device or CSS hidden.");
        return;
    }

    let isDragging = false;
    let touchId = null;
    let baseRect, centerX, centerY, maxRadius;

    function getTouch(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            if (event.changedTouches[i].identifier === touchId) {
                return event.changedTouches[i];
            }
        }
        return null; // Should not happen if touchId is managed correctly
    }

    function onTouchStart(event) {
        // Only handle the first touch on the handle
        if (isDragging || event.target !== handle) return;

        const touch = event.changedTouches[0];
        touchId = touch.identifier;
        isDragging = true;
        handle.style.cursor = 'grabbing';

        // Calculate geometry on first touch
        baseRect = base.getBoundingClientRect();
        centerX = baseRect.left + baseRect.width / 2;
        centerY = baseRect.top + baseRect.height / 2;
        maxRadius = baseRect.width / 2; // Use base radius as max distance

        event.preventDefault(); // Prevent scrolling/other default actions
    }

    function onTouchMove(event) {
        if (!isDragging) return;

        const touch = getTouch(event);
        if (!touch) return; // Not the touch we are tracking

        event.preventDefault();

        const touchX = touch.clientX;
        const touchY = touch.clientY;

        let deltaX = touchX - centerX;
        let deltaY = touchY - centerY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Clamp movement to the base radius
        if (distance > maxRadius) {
            deltaX = (deltaX / distance) * maxRadius;
            deltaY = (deltaY / distance) * maxRadius;
        }

        // Update handle visual position (relative to center)
        handle.style.transform = `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px)`;

        // Calculate normalized input (-1 to 1)
        // Invert Y because screen Y goes down, but 3D Z often goes "forward" as negative
        window.joystickInput.x = deltaX / maxRadius;
        window.joystickInput.y = -(deltaY / maxRadius); // Inverted Y
    }

    function onTouchEnd(event) {
        if (!isDragging) return;

        const touch = getTouch(event);
        if (!touch) return; // Not the touch we are tracking

        // Reset
        isDragging = false;
        touchId = null;
        handle.style.transform = 'translate(-50%, -50%)'; // Reset handle position
        handle.style.cursor = 'grab';
        window.joystickInput.x = 0;
        window.joystickInput.y = 0;
    }

    // Add listeners
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    // Listen on the whole document for move/end to handle dragging outside the container
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true }); // Handle cancellations

    console.log("Joystick setup complete.");
}

// Run setup after the DOM is loaded
window.addEventListener('DOMContentLoaded', setupJoystick); 