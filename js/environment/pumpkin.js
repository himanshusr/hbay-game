// Function to load and display the pumpkin - with improved positioning and size
function growPumpkin(position) {
    console.log("Starting to grow pumpkin at", position.toArray());
    
    // Create growing animation
    displayText('The pumpkin is sprouting!');
    
    // Load the pumpkin model
    const fbxLoader = new THREE.FBXLoader();
    console.log("Loading pumpkin model...");
    
    fbxLoader.load('assets/models/pumpkin.fbx', 
        // Success callback
        (object) => {
            console.log("Pumpkin model loaded successfully!");
            
            object.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Position at the seed location
            object.position.copy(position);
            
            // Set initial user data for tracking state
            object.userData = {
                fullyGrown: false,
                broken: false,
                isPumpkin: true,
                isGrowing: false // Initialize as not growing
            };
            
            // Calculate initial and final scales
            const initialScale = 0.001;
            const finalScale = 0.08 + Math.random() * 0.02; // Smaller pumpkins
            
            // Calculate proper y-offset based on scale to keep bottom at ground level
            // This value might need adjustment based on the specific pumpkin model
            const baseYOffset = 0.5;  // Base offset for the pumpkin
            const yScaleFactor = 100;  // Multiplier that adjusts how much Y increases with scale
            
            // Start small
            object.scale.set(initialScale, initialScale, initialScale);
            object.position.y = baseYOffset * initialScale * yScaleFactor;
            
            // Add to scene
            scene.add(object);
            
            // Add to pumpkins array
            pumpkins.push(object);
            
            // Animate growth
            const startTime = Date.now();
            const growDuration = 3000; // 3 seconds to grow
            
            const animateGrowth = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / growDuration, 1);
                
                // Ease-out growth curve
                const scale = finalScale * Math.pow(progress, 0.5);
                object.scale.set(scale, scale, scale);
                
                // Adjust Y position to keep bottom at ground level as it grows
                object.position.y = baseYOffset * scale * yScaleFactor;
                
                // Add slight wobble for organic feel
                if (progress < 1) {
                    const wobble = Math.sin(elapsed * 0.01) * 0.1 * (1 - progress);
                    object.rotation.y = wobble;
                    
                    // Mark as growing during the animation
                    object.userData.isGrowing = true; 
                    
                    requestAnimationFrame(animateGrowth);
                } else {
                    // Final position and rotation
                    object.position.y = baseYOffset * finalScale * yScaleFactor;
                    object.rotation.y = Math.random() * Math.PI * 2; // Random final rotation
                    
                    // Mark as fully grown and NOT growing anymore
                    object.userData.fullyGrown = true;
                    object.userData.isGrowing = false; 
                    
                    // Add to punchable pumpkins list
                    punchablePumpkins.push(object);
                    
                    console.log("Pumpkin fully grown and added to punchable list. Total punchable:", punchablePumpkins.length);
                    
                    // Add a visual indicator for debugging (floating text)
                    displayText('Your pumpkin has grown! Press P to punch it!');
                    
                    // Add a visible marker above the pumpkin for debugging
                    const markerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                    marker.position.copy(object.position);
                    marker.position.y += 2.0; // Position above pumpkin
                    scene.add(marker);
                    
                    // Make the marker blink
                    const blinkMarker = () => {
                        if (!object.parent) {
                            // Pumpkin was removed, remove marker too
                            scene.remove(marker);
                            return;
                        }
                        
                        marker.visible = !marker.visible;
                        setTimeout(blinkMarker, 500);
                    };
                    blinkMarker();
                }
            };
            
            animateGrowth();
        },
        // Progress callback
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Error callback
        (error) => {
            console.error('Error loading pumpkin model:', error);
            displayText('Failed to grow pumpkin :(');
        }
    );
}

// Function to find if there's a pumpkin nearby
function findNearbyPumpkin() {
    if (!zowieCharacter || punchablePumpkins.length === 0) {
        // Removed console.log("No character or no punchable pumpkins available");
        return null;
    }
    
    // Removed console.log("Checking for nearby pumpkins. Total punchable pumpkins:", punchablePumpkins.length);
    const zowiePosition = zowieCharacter.position.clone();
    const punchDistance = 10.0; // Much larger radius - increased from 5.0 to 10.0
    
    // Find the closest pumpkin
    let closestPumpkin = null;
    let closestDistance = Infinity;
    
    for (let i = 0; i < punchablePumpkins.length; i++) {
        const pumpkin = punchablePumpkins[i];
        
        const distance = zowiePosition.distanceTo(pumpkin.position);
        // Removed console.log("Distance to punchable pumpkin", i, ":", distance);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPumpkin = pumpkin;
        }
    }
    
    // Return the closest pumpkin if it's within range
    if (closestDistance <= punchDistance) {
        console.log("Found nearby pumpkin at distance:", closestDistance);
        return closestPumpkin;
    } else if (closestPumpkin) {
        // Removed console.log("Closest pumpkin too far away:", closestDistance);
        return null;
    }
    
    return null;
}

// Function to punch a pumpkin
function punchPumpkin(pumpkin) {
    if (!pumpkin) {
        console.log("No pumpkin to punch");
        return;
    }
    
    console.log("Punching pumpkin!");
    displayText('Smashing the pumpkin!');
    
    // Drop the bucket if Zowie is holding one
    if (isCarryingBucket && heldBucket) {
        console.log("Dropping bucket to punch pumpkin");
        dropBucket(); // Call the existing dropBucket function
    }
    
    // Remove from punchable pumpkins list
    const punchableIndex = punchablePumpkins.indexOf(pumpkin);
    if (punchableIndex > -1) {
        punchablePumpkins.splice(punchableIndex, 1);
        console.log("Pumpkin removed from punchable list. Remaining:", punchablePumpkins.length);
    }
    
    // Store pumpkin position and rotation for the broken version
    const pumpkinPosition = pumpkin.position.clone();
    const pumpkinRotation = pumpkin.rotation.clone();
    const pumpkinScale = pumpkin.scale.clone();
    
    // Play punching animation if available
    if (zowieThrowingAnimation) {
        // Stop current animation and play throwing/punching animation
        if (currentZowieAnimation === 'idle' && zowieIdleAnimation) {
            zowieIdleAnimation.stop();
        } else if (currentZowieAnimation === 'walk' && zowieWalkAnimation) {
            zowieWalkAnimation.stop();
        }
        
        zowieThrowingAnimation.reset();
        zowieThrowingAnimation.play();
        
        // Store previous animation to return to later
        const previousAnimation = currentZowieAnimation;
        currentZowieAnimation = 'throwing'; // Reuse throwing animation for punching
        
        console.log("Playing punch animation");
        
        // Return to previous animation after punch is complete
        const animationDuration = 1200; // Adjust timing as needed
        setTimeout(() => {
            if (zowieThrowingAnimation) zowieThrowingAnimation.stop();
            
            if (previousAnimation === 'idle' && zowieIdleAnimation) {
                zowieIdleAnimation.reset();
                zowieIdleAnimation.play();
                currentZowieAnimation = 'idle';
            } else if (previousAnimation === 'walk' && zowieWalkAnimation) {
                zowieWalkAnimation.reset();
                zowieWalkAnimation.play();
                currentZowieAnimation = 'walk';
            }
        }, animationDuration);
    }
    
    // Wait for the punch animation to reach the impact point
    setTimeout(() => {
        // Load broken pumpkin model
        const fbxLoader = new THREE.FBXLoader();
        fbxLoader.load('assets/models/broken_pumpkin.fbx',
            // Success callback for broken pumpkin
            (brokenPumpkin) => {
                console.log("Broken pumpkin model loaded successfully!");

                brokenPumpkin.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Position broken pumpkin at the same place as the original
                brokenPumpkin.position.copy(pumpkinPosition);
                brokenPumpkin.rotation.copy(pumpkinRotation);
                brokenPumpkin.scale.copy(pumpkinScale);

                // *** ADD HEIGHT ADJUSTMENT HERE ***
                // Example: Lower the broken pumpkin slightly
                // brokenPumpkin.position.y -= 0.1;
                // Or set a specific height:
                brokenPumpkin.position.y = 2.5; // Adjust this value as needed

                // Remove original pumpkin
                scene.remove(pumpkin);
                const index = pumpkins.indexOf(pumpkin);
                if (index > -1) {
                    pumpkins.splice(index, 1);
                }

                // Add broken pumpkin to scene
                scene.add(brokenPumpkin);

                // Add broken pumpkin to the array (optional)
                brokenPumpkin.userData = { broken: true, isPumpkin: true };
                pumpkins.push(brokenPumpkin);

                // Create smashing effect with particles
                createPumpkinSmashEffect(pumpkinPosition);

                // --- Load the key model ---
                const keyLoader = new THREE.FBXLoader();
                keyLoader.load('assets/models/door_key.fbx',
                    // Success callback for key
                    (keyObject) => {
                        console.log("Key model loaded successfully!");

                        keyObject.traverse(function(child) {
                            if (child.isMesh) {
                                child.castShadow = true;
                                // Keys might not need to receive shadows, but can be enabled if needed
                                // child.receiveShadow = true;
                            }
                        });

                        // Scale the key - adjust this value as needed
                        const keyScale = 0.05; // Example scale, make it smaller or larger
                        keyObject.scale.set(keyScale, keyScale, keyScale);

                        // Position the key above the broken pumpkin
                        keyObject.position.copy(brokenPumpkin.position);
                        keyObject.position.y += 0.5; // Adjust this offset to position it higher or lower

                        // Optional: Add slight random rotation
                        keyObject.rotation.y = Math.random() * Math.PI * 2;

                        // Add the key to the scene
                        scene.add(keyObject);

                        // *** Assign the key to the global variable ***
                        collectibleKey = keyObject; 
                        keyObject.userData.isKey = true; 

                        // *** ADD THIS LOG ***
                        console.log("Collectible key assigned:", collectibleKey); 

                        // COMPLETELY SELF-CONTAINED ROTATION AND BOBBING
                        // This doesn't rely on any external arrays or animation loops
                        (function animateKeyCompletely() {
                            // If key is removed from scene, stop animation
                            if (!keyObject.parent) return;
                            
                            // Rotate the key
                            keyObject.rotation.y += 0.02;
                            
                            // Bob the key up and down
                            const time = Date.now() * 0.002;
                            keyObject.position.y = brokenPumpkin.position.y + 0.5 + Math.sin(time) * 0.1;
                            
                            // Continue animation
                            requestAnimationFrame(animateKeyCompletely);
                        })();

                        // Log for debugging
                        console.log("Self-contained key animation started");

                    },
                    // Progress callback for key
                    (xhr) => {
                        console.log('Key: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                    },
                    // Error callback for key
                    (error) => {
                        console.error('Error loading key model:', error);
                    }
                );
                // --- End loading the key model ---

            },
            // Progress callback for broken pumpkin
            (xhr) => {
                console.log('Broken Pumpkin: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // Error callback for broken pumpkin
            (error) => {
                console.error('Error loading broken pumpkin model:', error);
                // If model fails to load, just remove the original pumpkin
                scene.remove(pumpkin);
                const index = pumpkins.indexOf(pumpkin);
                if (index > -1) {
                    pumpkins.splice(index, 1);
                }
            }
        );
    }, 500); // Time to wait for punch animation to reach impact point
}

// Function to create pumpkin smash particle effect
function createPumpkinSmashEffect(position) {
    const particleCount = 40;
    const particles = new THREE.Group();
    
    // Create pumpkin chunk particles
    for (let i = 0; i < particleCount; i++) {
        // Use random shapes for pumpkin chunks
        const geometry = i % 3 === 0 
            ? new THREE.TetrahedronGeometry(0.1 + Math.random() * 0.1)
            : (i % 3 === 1
                ? new THREE.BoxGeometry(0.1 + Math.random() * 0.1, 0.1 + Math.random() * 0.1, 0.1 + Math.random() * 0.1)
                : new THREE.SphereGeometry(0.1 + Math.random() * 0.05, 8, 8)
            );
        
        const material = new THREE.MeshStandardMaterial({
            color: i % 5 === 0 ? 0x2E8B57 : 0xFFA500, // Mix of green and orange
            roughness: 0.7,
            metalness: 0.2
        });
        
        const chunk = new THREE.Mesh(geometry, material);
        
        // Position at impact point
        chunk.position.copy(position);
        // Add random offsets, but more upward
        chunk.position.x += (Math.random() - 0.5) * 0.2;
        chunk.position.y += Math.random() * 0.5 + 0.3; // More upward
        chunk.position.z += (Math.random() - 0.5) * 0.2;
        
        // Random velocity for explosion effect
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.08,
            Math.random() * 0.2 + 0.05, // More upward
            (Math.random() - 0.5) * 0.08
        );
        
        chunk.userData.velocity = velocity;
        chunk.userData.rotationSpeed = new THREE.Vector3(
            Math.random() * 0.2,
            Math.random() * 0.2,
            Math.random() * 0.2
        );
        chunk.userData.lifetime = 1.5 + Math.random() * 1.0; // 1.5-2.5 seconds
        
        particles.add(chunk);
    }
    
    scene.add(particles);
    
    // Animate the particles
    const animateParticles = () => {
        let allDone = true;
        
        particles.children.forEach(chunk => {
            // Apply velocity and gravity
            chunk.position.add(chunk.userData.velocity);
            chunk.userData.velocity.y -= 0.01; // Gravity
            
            // Apply rotation
            chunk.rotation.x += chunk.userData.rotationSpeed.x;
            chunk.rotation.y += chunk.userData.rotationSpeed.y;
            chunk.rotation.z += chunk.userData.rotationSpeed.z;
            
            // Check for ground collision
            if (chunk.position.y < 0.05) {
                chunk.position.y = 0.05;
                chunk.userData.velocity.y *= -0.3; // Bounce with damping
                chunk.userData.velocity.x *= 0.8; // Friction
                chunk.userData.velocity.z *= 0.8; // Friction
                
                // Reduce rotation speed after bounce
                chunk.userData.rotationSpeed.multiplyScalar(0.8);
            }
            
            // Reduce lifetime
            chunk.userData.lifetime -= 0.016; // Approx 1 frame at 60fps
            
            // Scale down and fade out near end of lifetime
            if (chunk.userData.lifetime < 0.5) {
                const scale = Math.max(0.01, chunk.userData.lifetime / 0.5);
                chunk.scale.set(scale, scale, scale);
            }
            
            if (chunk.userData.lifetime > 0) {
                allDone = false;
            }
        });
        
        // Continue animation or clean up
        if (!allDone) {
            requestAnimationFrame(animateParticles);
        } else {
            scene.remove(particles);
            particles.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
    };
    
    animateParticles();
}