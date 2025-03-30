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
    if (!zowieCharacter) return false;
    
    let directionX = 0;
    let directionZ = 0;
    
    if (keys['ArrowUp']) directionZ = -1;
    if (keys['ArrowDown']) directionZ = 1;
    if (keys['ArrowLeft']) directionX = -1;
    if (keys['ArrowRight']) directionX = 1;
    
    const movedInput = (directionX !== 0 || directionZ !== 0); // Did user press move keys?
    let actualMovementOccurred = false; // Did the character actually move?

    if (movedInput) {
        const moveX = directionX * PARAMS.walkSpeed;
        const moveZ = directionZ * PARAMS.walkSpeed;
        
        // Calculate potential next position
        const potentialPosition = zowieCharacter.position.clone();
        potentialPosition.x += moveX;
        potentialPosition.z += moveZ;

        // Check for collision with pumpkins at the potential position
        // Assumes 'pumpkins' array is globally accessible from js/environment/main.js
        let collisionDetected = false;
        if (typeof pumpkins !== 'undefined') {
             collisionDetected = checkCharacterCollision(zowieCharacter, potentialPosition, pumpkins);
        }

        // Only move if no collision detected
        if (!collisionDetected) {
            // Rotate Zowie character to face movement direction
            if (directionX !== 0 || directionZ !== 0) {
                const angle = Math.atan2(directionX, directionZ);
                zowieCharacter.rotation.y = angle;
            }
            // Move Zowie character by updating position
            zowieCharacter.position.copy(potentialPosition); 
            actualMovementOccurred = true; // Movement happened
        }
        // If collisionDetected, Zowie's position is NOT updated.
    }
    
    // Return state indicating if input was pressed AND if movement occurred
    return {
        moved: movedInput && actualMovementOccurred, 
        directionX: directionX,
        directionZ: directionZ
    };
}

// Update Zowie's animation based on movement input
function updateZowieAnimation(inputState) {
    if (!inputState || !zowieCharacter) return; // Check zowieCharacter exists
    
    // Animation state handling for Zowie
    if (inputState.moved && currentZowieAnimation !== 'walk') {
        if (zowieWalkAnimation) {
            if (zowieIdleAnimation && currentZowieAnimation === 'idle') zowieIdleAnimation.fadeOut(0.2);
            // Add checks for other animations if they exist (like throwing)
            else if (zowieThrowingAnimation && currentZowieAnimation === 'throwing') zowieThrowingAnimation.stop(); 

            zowieWalkAnimation.reset().fadeIn(0.2).play();
            currentZowieAnimation = 'walk';
            isWalking = true; // Keep isWalking potentially for Zowie's state if needed elsewhere
            hasStartedWalking = true; // Keep this if camera logic depends on it
        }
    } else if (!inputState.moved && currentZowieAnimation === 'walk') {
        if (zowieIdleAnimation) {
            if (zowieWalkAnimation) zowieWalkAnimation.fadeOut(0.2);
            zowieIdleAnimation.reset().fadeIn(0.2).play();
            currentZowieAnimation = 'idle';
            isWalking = false;
        }
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

// Function to update HSR character's following behavior and animation
function updateHSRFollowing() {
    if (!yourCharacter || !zowieCharacter) return;

    // --- Tuning Parameters ---
    const followDistance = 2.0; 
    const sideOffset = 0.8;     
    const randomFactor = 0.2;   
    const stopDistance = 1.8;   
    const turnSpeed = 0.05;     
    const lerpFactor = 0.04;    

    // --- Calculate target position (remains the same) ---
    const zowieDirection = new THREE.Vector3();
    zowieCharacter.getWorldQuaternion(tempQuaternion); 
    zowieDirection.set(0, 0, 1).applyQuaternion(tempQuaternion).normalize();
    const targetPosition = zowieCharacter.position.clone();
    targetPosition.addScaledVector(zowieDirection, -followDistance); 
    const rightVector = new THREE.Vector3().crossVectors(zowieCharacter.up, zowieDirection).normalize();
    const currentSideOffset = sideOffset + (Math.random() - 0.5) * randomFactor * 2; 
    targetPosition.addScaledVector(rightVector, currentSideOffset);

    // --- Movement ---
    const distanceToTarget = yourCharacter.position.distanceTo(targetPosition);
    let shouldMove = false; // Assume no movement initially

    if (distanceToTarget > stopDistance) {
        // Calculate potential next position based on lerp
        const potentialPosition = yourCharacter.position.clone().lerp(targetPosition, lerpFactor);

        // Check for collision at the potential position
        let collisionDetected = false;
        if (typeof pumpkins !== 'undefined') {
            collisionDetected = checkCharacterCollision(yourCharacter, potentialPosition, pumpkins);
        }

        // Only move if no collision detected
        if (!collisionDetected) {
            yourCharacter.position.copy(potentialPosition); // Apply the lerped position
            shouldMove = true; // Movement happened
        } 
        // If collisionDetected, HSR's position is NOT updated.
    } 

    // --- Rotation (remains the same) ---
    const targetQuaternion = zowieCharacter.quaternion.clone(); 
    yourCharacter.quaternion.slerp(targetQuaternion, turnSpeed);

    // --- Animation (remains the same, based on shouldMove flag) ---
    if (shouldMove && !isHSRWalking) {
        if (yourWalkAnimation) {
            if (yourIdleAnimation && currentYourAnimation === 'idle') yourIdleAnimation.fadeOut(0.2);
            yourWalkAnimation.reset().fadeIn(0.2).play();
            currentYourAnimation = 'walk';
            isHSRWalking = true;
        }
    } else if (!shouldMove && isHSRWalking) {
        if (yourIdleAnimation) {
            if (yourWalkAnimation) yourWalkAnimation.fadeOut(0.2);
            yourIdleAnimation.reset().fadeIn(0.2).play();
            currentYourAnimation = 'idle';
            isHSRWalking = false;
        }
    }
}

// Helper variable (declare globally or pass into the function if needed)
let tempQuaternion = new THREE.Quaternion();

// Helper function to check collision between a character and obstacles
function checkCharacterCollision(character, potentialPosition, obstacles) {
    if (!character || !obstacles || obstacles.length === 0) return false;

    const characterName = character === zowieCharacter ? "Zowie" : "HSR"; // Identify character
    const characterBox = new THREE.Box3();
    const originalPosition = character.position.clone();
    const originalMatrixWorld = character.matrixWorld.clone();

    // Temporarily move character to potential position
    character.position.copy(potentialPosition);
    character.updateMatrixWorld(true); // Force update world matrix at potential position
    characterBox.setFromObject(character); // Get bounding box at potential position

    // --- Restore character state ---
    character.position.copy(originalPosition);
    character.matrixWorld.copy(originalMatrixWorld);
    // Note: If matrixAutoUpdate is true, the matrix might update again automatically.
    // Consider setting character.matrixAutoUpdate = false if managing matrices manually.

    // --- Shrinking removed ---
    // characterBox.expandByScalar(-0.05);

    const obstacleBox = new THREE.Box3();
    for (const obstacle of obstacles) {
        // Check against valid, non-broken pumpkins (growing or fully grown)
        if (obstacle && obstacle.userData && obstacle.userData.isPumpkin && !obstacle.userData.broken && obstacle.visible) {
            obstacle.updateMatrixWorld(true); // Ensure obstacle matrix is up-to-date
            obstacleBox.setFromObject(obstacle); // Get pumpkin's bounding box

            // --- Shrinking removed ---
            // obstacleBox.expandByScalar(-0.05); // Shrink pumpkin box too

            if (characterBox.intersectsBox(obstacleBox)) {
                 // --- Add Logging Here ---
                 console.log(`CHECK: ${characterName} potential move to`, potentialPosition, `blocked by pumpkin at`, obstacle.position);
                 // --- End Logging ---
                return true; // Collision found
            }
        }
    }
    return false; // No collision
}

// Helper function to push character away from intersecting pumpkins
function resolveCharacterPumpkinCollisions(character, obstacles) {
    if (!character || !obstacles || obstacles.length === 0) return;

    const characterName = character === zowieCharacter ? "Zowie" : "HSR"; // Identify character
    const characterBox = new THREE.Box3();
    const obstacleBox = new THREE.Box3();
    const pushBuffer = 0.02; // Extra distance to push out for fully grown pumpkins
    const growingPushBuffer = 0.2; // Stronger push for growing pumpkins

    character.updateMatrixWorld(true);
    characterBox.setFromObject(character);

    for (const obstacle of obstacles) {
        // Check against valid, non-broken pumpkins (growing or fully grown)
        if (obstacle && obstacle.userData && obstacle.userData.isPumpkin && !obstacle.userData.broken && obstacle.visible) {
            obstacle.updateMatrixWorld(true);
            obstacleBox.setFromObject(obstacle);

            if (characterBox.intersectsBox(obstacleBox)) {
                // Check if the pumpkin is fully grown or still growing
                const isGrowing = !obstacle.userData.fullyGrown;
                const currentBuffer = isGrowing ? growingPushBuffer : pushBuffer;
                
                // Log the collision
                const posBefore = character.position.clone();
                console.log(`RESOLVE: ${characterName} intersecting with ${isGrowing ? 'GROWING' : 'FULLY GROWN'} pumpkin! Pos before push:`, posBefore);

                // Calculate Intersection Depth and Push
                const intersection = new THREE.Box3();
                intersection.copy(characterBox).intersect(obstacleBox);

                const intersectionSize = new THREE.Vector3();
                intersection.getSize(intersectionSize);

                const pushDirection = new THREE.Vector3();
                pushDirection.subVectors(character.position, obstacle.position);
                pushDirection.y = 0; 
                if (pushDirection.lengthSq() < 0.0001) {
                    pushDirection.set(1, 0, 0);
                }
                pushDirection.normalize();

                const overlapX = intersectionSize.x;
                const overlapZ = intersectionSize.z;
                const pushDistance = Math.max(overlapX, overlapZ) + currentBuffer; 

                // Check if character is completely inside the pumpkin
                // This happens if the character's bounding box is entirely contained within the pumpkin's box
                const isCompletelyInside = 
                    characterBox.min.x >= obstacleBox.min.x && characterBox.max.x <= obstacleBox.max.x &&
                    characterBox.min.z >= obstacleBox.min.z && characterBox.max.z <= obstacleBox.max.z;

                // If completely inside, use a much stronger push
                const finalPushDistance = isCompletelyInside ? 
                    Math.max(obstacleBox.max.x - obstacleBox.min.x, obstacleBox.max.z - obstacleBox.min.z) + 0.5 : 
                    pushDistance;

                // Apply the push
                character.position.addScaledVector(pushDirection, finalPushDistance);
                character.updateMatrixWorld(true); 

                const posAfter = character.position.clone();
                console.log(`RESOLVE: ${characterName} pushed by overlap from ${isGrowing ? 'GROWING' : 'FULLY GROWN'} pumpkin. ${isCompletelyInside ? 'COMPLETELY INSIDE! ' : ''}Overlap (x,z): (${overlapX.toFixed(3)}, ${overlapZ.toFixed(3)}), Push Dist: ${finalPushDistance.toFixed(3)}, Pos after push:`, posAfter);
            }
        }
    }
}

// --- In your main animate loop (e.g., in js/main.js) ---
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // --- Collision Resolution Step (Run FIRST) ---
    // Resolve any current overlaps for both characters BEFORE processing movement.
    // Assumes 'pumpkins' array is accessible here.
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

    // 1. Process Zowie's input (now starts from a potentially resolved position)
    // This function is defined in js/controls.js
    const inputState = processInput();

    // 2. Update Zowie's animation
    // This function is defined in js/controls.js
    updateZowieAnimation(inputState);

    // 3. Update HSR's following behavior (now starts from a potentially resolved position)
    // This function is defined in js/controls.js
    updateHSRFollowing();

    // 4. Update mixers
    if (yourMixer) yourMixer.update(delta);
    if (zowieMixer) zowieMixer.update(delta);

    // 5. Update camera and controls
    // This function is defined in js/controls.js
    updateCamera();
    // Note: updateCamera() calls controls.update() internally if needed

    // 6. Update environment (e.g., pumpkin growth, etc.)
    // This function is likely defined in js/environment/main.js or similar
    updateEnvironment();

    // 7. Render
    renderer.render(scene, camera);
}

let isHSRWalking = false; 
