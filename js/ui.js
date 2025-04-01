// References to the action buttons
let pickupButton, dropButton, fillButton, throwButton, punchButton, unlockButton;

// Function to initialize UI elements
function setupUI() {
    pickupButton = document.getElementById('action-button-pickup');
    dropButton = document.getElementById('action-button-drop');
    fillButton = document.getElementById('action-button-fill');
    throwButton = document.getElementById('action-button-throw');
    punchButton = document.getElementById('action-button-punch');
    unlockButton = document.getElementById('action-button-unlock');

    // Add event listeners (using touchstart for better mobile responsiveness)
    addButtonListener(pickupButton, 'c');
    addButtonListener(dropButton, 'd');
    addButtonListener(fillButton, 'f');
    addButtonListener(throwButton, 't');
    addButtonListener(punchButton, 'p');
    addButtonListener(unlockButton, 'u');
}

// Helper to add listeners and simulate key press
function addButtonListener(button, key) {
    if (!button) return; // Button might not exist if element ID is wrong

    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double-tap zoom, etc.
        // Simulate the key press for one frame (e.g., 50ms)
        window.simulatedKeyPress = { key: key, time: Date.now() + 50 };
        // Optional: Visual feedback
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    });
    // Reset visual feedback on touch end
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    });
     // Fallback for non-touch testing or devices that register clicks
    button.addEventListener('click', (e) => {
         e.preventDefault();
         window.simulatedKeyPress = { key: key, time: Date.now() + 50 };
    });
}


// Function to update button visibility based on game state
// This should be called in the main animation loop
function updateActionButtonsVisibility() {
    // Ensure UI is set up and state functions are available
    if (!pickupButton || typeof window.canPickupItem !== 'function') return;

    // Check conditions using the functions from environment/main.js
    const showPickup = window.canPickupItem();
    const showDrop = window.canDropItem();
    const showFill = window.canFillBucket();
    const showThrow = window.canThrowWater();
    const showPunch = window.canPunchPumpkin();
    const showUnlock = window.canUnlockDoor();

    // Toggle visibility using the CSS class
    toggleButtonVisibility(pickupButton, showPickup);
    toggleButtonVisibility(dropButton, showDrop);
    toggleButtonVisibility(fillButton, showFill);
    toggleButtonVisibility(throwButton, showThrow);
    toggleButtonVisibility(punchButton, showPunch);
    toggleButtonVisibility(unlockButton, showUnlock);
}

// Helper to toggle button visibility class
function toggleButtonVisibility(button, show) {
    if (!button) return;
    if (show) {
        button.classList.add('action-button-visible');
    } else {
        button.classList.remove('action-button-visible');
    }
}

// Initialize UI when the DOM is ready
window.addEventListener('DOMContentLoaded', setupUI); 