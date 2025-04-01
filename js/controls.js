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

// Vectors for camera-relative movement calculation (declared outside to avoid reallocation)
const cameraDirection = new THREE.Vector3();
const cameraForward = new THREE.Vector3();
const cameraRight = new THREE.Vector3();
const worldMoveVector = new THREE.Vector3(); // To store the final world-space direction

// Process keyboard input and update character movement
function processInput() {
    if (!zowieCharacter || !camera) return false; // Ensure camera exists

    let inputX = 0;
    let inputY = 0; // Use generic input names before mapping
    let isJoystickActive = false;

    // Check joystick input first
    if (typeof window.joystickInput !== 'undefined' && (window.joystickInput.x !== 0 || window.joystickInput.y !== 0)) {
        inputX = window.joystickInput.x;
        inputY = window.joystickInput.y; // Use joystick Y directly
        isJoystickActive = true;
    } else {
        // Fallback to keyboard
        if (keys['ArrowUp']) inputY = 1;    // Map keyboard Up to positive Y input
        if (keys['ArrowDown']) inputY = -1; // Map keyboard Down to negative Y input
        if (keys['ArrowLeft']) inputX = -1;
        if (keys['ArrowRight']) inputX = 1;
    }

    const movedInput = (inputX !== 0 || inputY !== 0);
    let actualMovementOccurred = false;
    let moveX = 0;
    let moveZ = 0;
    let targetAngle = zowieCharacter.rotation.y; // Default to current angle

    if (movedInput) {
        // Calculate magnitude for speed scaling (especially for joystick)
        const magnitude = Math.min(1.0, Math.sqrt(inputX * inputX + inputY * inputY));
        const moveSpeed = PARAMS.walkSpeed * 1.1 * magnitude; // Scale speed by magnitude

        if (isJoystickActive) {
            // --- Camera-Relative Movement ---
            // 1. Get camera forward direction (projected onto XZ plane)
            camera.getWorldDirection(cameraDirection);
            cameraForward.set(cameraDirection.x, 0, cameraDirection.z).normalize();

            // 2. Get camera right direction (perpendicular to forward on XZ plane)
            // cameraRight.set(cameraForward.z, 0, -cameraForward.x); // Simple 90-degree rotation
            // Or using cross product with world up vector:
            cameraRight.crossVectors(camera.up, cameraForward).normalize(); // camera.up is usually (0,1,0)

            // 3. Calculate world-space movement vector based on joystick input and camera orientation
            // Joystick Y controls movement along cameraForward, Joystick X along cameraRight
            worldMoveVector.x = (cameraForward.x * inputY + cameraRight.x * inputX);
            worldMoveVector.z = (cameraForward.z * inputY + cameraRight.z * inputX);

            // Normalize the final world direction vector if it's not zero
            if (worldMoveVector.lengthSq() > 0.001) { // Use lengthSq for efficiency
                 worldMoveVector.normalize();
                 targetAngle = Math.atan2(worldMoveVector.x, worldMoveVector.z); // Calculate angle based on world vector
            }

            moveX = worldMoveVector.x * moveSpeed;
            moveZ = worldMoveVector.z * moveSpeed;
            // --- End Camera-Relative ---

        } else {
            // --- World-Relative (Keyboard) Movement ---
            // Keyboard uses direct world axes for simplicity (Up = -Z, Down = +Z, Left = -X, Right = +X)
            // Note: We mapped keyboard Up/Down to inputY earlier.
            // Remap inputY to Z movement for keyboard: Up (inputY=1) -> -Z, Down (inputY=-1) -> +Z
            let keyDirectionX = inputX;
            let keyDirectionZ = -inputY; // Invert Y input for Z direction

            // Normalize keyboard direction vector if moving diagonally
            const keyDirLength = Math.sqrt(keyDirectionX * keyDirectionX + keyDirectionZ * keyDirectionZ);
            if (keyDirLength > 0) {
                keyDirectionX /= keyDirLength;
                keyDirectionZ /= keyDirLength;
                targetAngle = Math.atan2(keyDirectionX, keyDirectionZ); // Angle based on direct input
            }

            moveX = keyDirectionX * moveSpeed;
            moveZ = keyDirectionZ * moveSpeed;
            // --- End World-Relative ---
        }


        // Calculate potential next position
        const potentialPosition = zowieCharacter.position.clone();
        potentialPosition.x += moveX;
        potentialPosition.z += moveZ;

        // Check for collision with pumpkins at the potential position
        let collisionDetected = false;
        if (typeof pumpkins !== 'undefined' && typeof checkCharacterCollision === 'function') {
             collisionDetected = checkCharacterCollision(zowieCharacter, potentialPosition, pumpkins);
        } else if (typeof checkCharacterCollision !== 'function') {
            console.warn("checkCharacterCollision function not found!");
        }

       // Only move if no collision detected
        if (!collisionDetected) {
            // Rotate Zowie character smoothly towards the target angle
            const targetQuaternion = new THREE.Quaternion();
            targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
            zowieCharacter.quaternion.slerp(targetQuaternion, 0.15); // Adjust slerp factor for rotation speed

            // Move Zowie character by updating position
            zowieCharacter.position.copy(potentialPosition);
           actualMovementOccurred = true; // Movement happened
        }
    }

    // Return state indicating if input was pressed AND if movement occurred
    return {
        moved: movedInput && actualMovementOccurred,
        directionX: moveX, // Return the actual movement applied (can be useful)
        directionZ: moveZ
    };
}

// Update Zowie's animation based on movement input
function updateZowieAnimation(inputState) {
    if (!inputState || !zowieCharacter) return; // Check zowieCharacter exists
    
    // Animation state handling for Zowie
    if (inputState.moved && currentZowieAnimation !== 'walk') {
        if (zowieWalkAnimation) {
            if (zowieIdleAnimation && currentZowieAnimation === 'idle') zowieIdleAnimation.fadeOut(0.1); // Faster transition
            // Add checks for other animations if they exist (like throwing)
            else if (zowieThrowingAnimation && currentZowieAnimation === 'throwing') zowieThrowingAnimation.stop(); 

            zowieWalkAnimation.reset().fadeIn(0.1).play(); // Faster transition
            // Make the walk animation faster
            zowieWalkAnimation.setEffectiveTimeScale(1.2); // Speed up animation
            currentZowieAnimation = 'walk';
            isWalking = true;
            hasStartedWalking = true;
        }
    } else if (!inputState.moved && currentZowieAnimation === 'walk') {
        if (zowieIdleAnimation) {
            if (zowieWalkAnimation) zowieWalkAnimation.fadeOut(0.1); // Faster transition
            zowieIdleAnimation.reset().fadeIn(0.1).play(); // Faster transition
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
        let offset;
        if (!hasStartedWalking) {
            // Use farViewOffset initially, before any walking has occurred
            offset = farViewOffset;
        } else {
            // Once walking has started, use the normal defaultOffset
            offset = defaultOffset;
        }
        
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
    const turnSpeed = 0.1;     // Faster turning
    const lerpFactor = 0.05;    // Faster movement

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
    } 

    // --- Rotation (remains the same) ---
    const targetQuaternion = zowieCharacter.quaternion.clone(); 
    yourCharacter.quaternion.slerp(targetQuaternion, turnSpeed);

    // --- Animation (remains the same, based on shouldMove flag) ---
    if (shouldMove && !isHSRWalking) {
        if (yourWalkAnimation) {
            if (yourIdleAnimation && currentYourAnimation === 'idle') yourIdleAnimation.fadeOut(0.1);
            yourWalkAnimation.reset().fadeIn(0.1).play();
            yourWalkAnimation.setEffectiveTimeScale(1.2); // Speed up animation
            currentYourAnimation = 'walk';
            isHSRWalking = true;
        }
    } else if (!shouldMove && isHSRWalking) {
        if (yourIdleAnimation) {
            if (yourWalkAnimation) yourWalkAnimation.fadeOut(0.1);
            yourIdleAnimation.reset().fadeIn(0.1).play();
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

    const characterName = character === zowieCharacter ? "Zowie" : "HSR";
    const characterBox = new THREE.Box3();
    const obstacleBox = new THREE.Box3();
    const pushBuffer = 0.02; // Extra distance to push out for fully grown pumpkins
    const growingPushBuffer = 0.2; // Stronger push for growing pumpkins

    character.updateMatrixWorld(true);
    characterBox.setFromObject(character);

    for (const obstacle of obstacles) {
        if (obstacle && obstacle.userData && obstacle.userData.isPumpkin && !obstacle.userData.broken && obstacle.visible) {
            
            // If we reach here, the pumpkin is either growing or fully grown
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

                character.position.addScaledVector(pushDirection, pushDistance);
                character.updateMatrixWorld(true); 

                const posAfter = character.position.clone();
                console.log(`RESOLVE: ${characterName} pushed by overlap from ${isGrowing ? 'GROWING' : 'FULLY GROWN'} pumpkin. Overlap (x,z): (${overlapX.toFixed(3)}, ${overlapZ.toFixed(3)}), Push Dist: ${pushDistance.toFixed(3)}, Pos after push:`, posAfter);
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
