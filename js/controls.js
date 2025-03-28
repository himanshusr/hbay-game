// Keyboard state
const keys = {};

// Initialize keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });
}

// Process keyboard input and update character movement
function processInput() {
    if (!yourCharacter || !zowieCharacter) return false;
    
    let directionX = 0;
    let directionZ = 0;
    
    if (keys['ArrowUp']) directionZ = -1;
    if (keys['ArrowDown']) directionZ = 1;
    if (keys['ArrowLeft']) directionX = -1;
    if (keys['ArrowRight']) directionX = 1;
    
    const moved = (directionX !== 0 || directionZ !== 0);
    
    if (moved) {
        // Calculate movement vector
        const moveX = directionX * PARAMS.walkSpeed;
        const moveZ = directionZ * PARAMS.walkSpeed;
        
        // Rotate character to face movement direction
        if (directionX !== 0 || directionZ !== 0) {
            const angle = Math.atan2(directionX, directionZ);
            yourCharacter.rotation.y = angle;
            zowieCharacter.rotation.y = angle;
        }
        
        // Move characters
        yourCharacter.position.x += moveX;
        yourCharacter.position.z += moveZ;
        zowieCharacter.position.x += moveX;
        zowieCharacter.position.z += moveZ;
    }
    
    return {
        moved: moved,
        directionX: directionX,
        directionZ: directionZ
    };
}

// Update character animations based on movement
function updateCharacterAnimations(inputState) {
    if (!inputState) return;
    
    // Animation state handling
    if (inputState.moved && !isWalking) {
        if (yourWalkAnimation) {
            if (yourIdleAnimation) yourIdleAnimation.stop();
            yourWalkAnimation.play();
        }
        if (zowieWalkAnimation) {
            if (zowieIdleAnimation) zowieIdleAnimation.stop();
            zowieWalkAnimation.play();
        }
        isWalking = true;
        hasStartedWalking = true;
    } else if (!inputState.moved && isWalking) {
        if (yourWalkAnimation) {
            yourWalkAnimation.stop();
            if (yourIdleAnimation) yourIdleAnimation.play();
        }
        if (zowieWalkAnimation) {
            zowieWalkAnimation.stop();
            if (zowieIdleAnimation) zowieIdleAnimation.play();
        }
        isWalking = false;
    }
}

// Update camera position to follow character
function updateCamera() {
    if (!yourCharacter) return;
    
    // Camera logic
    controls.target.copy(yourCharacter.position); // Always sync target to character
    
    if (!controls.enabled) {
        // Default follow mode: switch offset based on walking state
        const offset = hasStartedWalking ? defaultOffset : initialOffset;
        const targetPosition = yourCharacter.position.clone().add(offset);
        camera.position.lerp(targetPosition, 0.1); // Smooth follow
        camera.lookAt(yourCharacter.position);
    } else {
        // Click-and-drag mode: allow angle change with OrbitControls
        controls.update();
    }
}
