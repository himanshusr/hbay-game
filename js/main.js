function init() {
    // Set up the scene, camera, renderer, and lighting
    setupScene();
    
    // Set up environment elements
    setupEnvironment();
    
    // Set up keyboard controls
    setupKeyboardControls();
    
    // Load character models
    loadCharacters();
    
    // Set up profile placeholders
    createGhibliPlaceholder('Himanshu', 20);
    createGhibliPlaceholder('Zowie', 130);
    
    // Start animation loop
    animate();
}

// Start the application
window.addEventListener('DOMContentLoaded', init);