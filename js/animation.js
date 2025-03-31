// Animation state
let balloonsReleased = false;

// Variables to track mouse state
let isMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };

// Main animation loop
function animate() {
    // Log 1: Check if animate is running
    // console.log("Animate loop running - Time:", Date.now()); 
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Update star twinkle effect
    if (stars && stars.material) {
        stars.material.opacity = 0.7 + Math.sin(elapsedTime * 0.5) * 0.3;
    }
    
    // --- Collision Resolution Step (Run FIRST) ---
    // Resolve any current overlaps for both characters BEFORE processing movement.
    // Assumes 'pumpkins' array is globally accessible from js/environment/main.js
    if (typeof pumpkins !== 'undefined') {
        if (zowieCharacter) {
            // This function is defined in js/controls.js
            resolveCharacterPumpkinCollisions(zowieCharacter, pumpkins);
        }
        if (yourCharacter) {
            // This function is defined in js/controls.js
            resolveCharacterPumpkinCollisions(yourCharacter, pumpkins);
        }
    }
    // --- End Collision Resolution ---
    
    // Update character animations
    if (typeof yourMixer !== 'undefined' && yourMixer) yourMixer.update(delta);
    if (typeof zowieMixer !== 'undefined' && zowieMixer) zowieMixer.update(delta);
    
    // Process input and update movements
    const inputState = processInput();
    updateZowieAnimation(inputState);
    updateHSRFollowing();
    
    // Update camera
    updateCamera();
    
    // Check for balloon release trigger
    checkBalloonRelease(delta);
    
    // Update environment
    updateEnvironment();

    // --- START: Rotate Keys ---
    // Log 2: Check if rotatingKeys is accessible and what it contains
    // console.log("Checking rotatingKeys in animate:", rotatingKeys); 

    if (typeof rotatingKeys !== 'undefined' && Array.isArray(rotatingKeys)) {
        const rotationSpeed = 0.02; 
        
        for (let i = rotatingKeys.length - 1; i >= 0; i--) {
            const key = rotatingKeys[i];
            if (key && key.parent === scene) { 
                key.rotation.y += rotationSpeed;
                // Log 3: Confirm rotation is being applied
                // console.log("Rotating key:", key.uuid, "New Y rotation:", key.rotation.y); 
            } else {
                console.log("Removing key from rotatingKeys array (not in scene?)."); 
                rotatingKeys.splice(i, 1);
            }
        }
    } else {
        // Log 4: Indicate if rotatingKeys is not found or not an array
        // console.log("rotatingKeys is undefined or not an array in animate.");
    }
    // --- END: Rotate Keys ---

    // Update camera info display
    updateCameraInfo();

    if (palmTrees) {
        palmTrees.children.forEach(tree => {
            if (tree.userData.update) {
                tree.userData.update(elapsedTime);
            }
        });
    }
    
    // Render the scene - Make sure this is AFTER the rotation code
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        renderer.render(scene, camera);
    }
}

// Check if balloons should be released
function checkBalloonRelease(delta) {
    if (!yourCharacter || balloonsReleased) return;
    
    if (yourCharacter.position.z <= -20 && !balloonsReleased) {
        balloonsReleased = true;
        
        // Animation for balloons rising
        balloons.children.forEach(balloon => {
            const riseSpeed = 0.5 + Math.random() * 0.5;
            const driftX = (Math.random() - 0.5) * 0.1;
            const driftZ = (Math.random() - 0.5) * 0.1;
            
            const rise = () => {
                balloon.position.y += riseSpeed * delta;
                balloon.position.x += driftX * delta;
                balloon.position.z += driftZ * delta;
                if (balloon.position.y < 50) requestAnimationFrame(rise);
            };
            rise();
        });
        
        // Show birthday message
        const birthdayMessage = document.getElementById('birthday-message');
        if (birthdayMessage) {
            birthdayMessage.textContent = 'Belated Happy Birthday Zowie!';
            birthdayMessage.style.opacity = '1';
        }
    }
}

// Update camera info display
function updateCameraInfo() {
    if (window.cameraInfo && camera) {
        window.cameraInfo.textContent = `Camera: x:${camera.position.x.toFixed(2)} y:${camera.position.y.toFixed(2)} z:${camera.position.z.toFixed(2)}`;
    }
}

// Add event listeners for mouse actions
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Only trigger on left mouse button
        isMouseDown = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

// Optional: prevent context menu on right-click
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
