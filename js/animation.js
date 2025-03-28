// Animation state
let balloonsReleased = false;

// Variables to track mouse state
let isMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Update star twinkle effect
    if (stars && stars.material) {
        stars.material.opacity = 0.7 + Math.sin(elapsedTime * 0.5) * 0.3;
    }
    
    // Animate palm trees swaying
    if (palmTrees) {
        palmTrees.children.forEach(tree => {
            tree.rotation.z = Math.sin(elapsedTime * 0.3) * 0.05;
        });
    }
    
    // Update character animations
    if (yourMixer) yourMixer.update(delta);
    if (zowieMixer) zowieMixer.update(delta);
    
    // Process input and update movements
    const inputState = processInput();
    updateCharacterAnimations(inputState);
    updateCamera();
    
    // Check for balloon release trigger
    checkBalloonRelease(delta);
    
    // Update environment
    updateEnvironment();
    
    // Update camera info display
    updateCameraInfo();
    
    // Render the scene
    renderer.render(scene, camera);
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

window.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;

    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    // Update camera rotation based on mouse movement
    camera.rotation.y -= deltaX * 0.002;
    
    // Limit vertical rotation to prevent camera flipping
    const newXRotation = camera.rotation.x - deltaY * 0.002;
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, newXRotation));

    previousMousePosition = { x: event.clientX, y: event.clientY };
});

// Optional: prevent context menu on right-click
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
