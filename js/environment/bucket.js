// Function to create a red bucket
function createRedBucket() {
    const bucketGroup = new THREE.Group();
    
    // Bucket body - cylinder with slight taper
    const bucketGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.6, 16);
    const bucketMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc0000, // Bright red
        roughness: 0.7,
        metalness: 0.3
    });
    const bucket = new THREE.Mesh(bucketGeometry, bucketMaterial);
    bucket.position.y = 0.3; // Half height
    bucketGroup.add(bucket);
    
    // Bucket rim - slightly wider at the top
    const rimGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 24);
    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xdd0000, // Slightly brighter red
        roughness: 0.5,
        metalness: 0.4
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0.6; // Position at top of bucket
    rim.rotation.x = Math.PI / 2; // Lay flat
    bucketGroup.add(rim);
    
    // Bucket handle
    const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.4, 0.6, 0),
        new THREE.Vector3(-0.3, 0.9, 0),
        new THREE.Vector3(0.3, 0.9, 0),
        new THREE.Vector3(0.4, 0.6, 0)
    ]);
    const handleGeometry = new THREE.TubeGeometry(handleCurve, 12, 0.03, 8, false);
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0xdd0000,
        roughness: 0.5,
        metalness: 0.4
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    bucketGroup.add(handle);
    
    // Add water mesh (initially invisible)
    const waterGeometry = new THREE.CylinderGeometry(0.38, 0.28, 0.4, 16);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff, // Bright blue water
        emissive: 0x0044aa, // Add slight glow
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = 0.4; // Position near top of bucket
    water.visible = false; // Initially invisible
    water.name = "bucketWater"; // Name for easy reference
    bucketGroup.add(water);
    
    // Position the bucket at the edge of the pond
    bucketGroup.position.set(21, 0, 15); // Adjust position to be at the edge of the pond
    
    // Add user data for interaction
    bucketGroup.userData.isPickupable = true;
    bucketGroup.userData.type = 'bucket';
    
    return bucketGroup;
}


// Function to check if Zowie is near the bucket
function isNearBucket() {
    if (!zowieCharacter || !bucket) return false;
    
    const zowiePosition = zowieCharacter.position.clone();
    const bucketPosition = bucket.position.clone();
    const distance = zowiePosition.distanceTo(bucketPosition);
    
    return distance <= pickupDistance * 1.2;
}

// Function to check if Zowie is near the pond
function isNearPond() {
    if (!zowieCharacter) return false;
    
    const zowiePosition = zowieCharacter.position.clone();
    const pondPosition = new THREE.Vector3(25, 0, 15); // Pond position from createGhibliPond
    const distance = zowiePosition.distanceTo(pondPosition);
    
    // Use a reasonable distance for interaction with the pond
    return distance <= 10; // Pond radius is 8, so this gives some margin
}

function pickupBucket() {
    if (isCarryingBucket || !bucket) return;
    
    isCarryingBucket = true;
    bucket.visible = false;
    
    const heldBucketGroup = new THREE.Group();
    
    // Create smaller bucket for holding
    const bucketGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 16);
    const bucketMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc0000,
        roughness: 0.7,
        metalness: 0.3
    });
    const bucketMesh = new THREE.Mesh(bucketGeometry, bucketMaterial);
    bucketMesh.position.y = 0.125; // Center of cylinder
    heldBucketGroup.add(bucketMesh);
    
    const rimGeometry = new THREE.TorusGeometry(0.15, 0.015, 8, 24);
    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xdd0000,
        roughness: 0.5,
        metalness: 0.4
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0.25;
    rim.rotation.x = Math.PI / 2;
    heldBucketGroup.add(rim);
    
    const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.15, 0.25, 0),
        new THREE.Vector3(-0.12, 0.35, 0),
        new THREE.Vector3(0.12, 0.35, 0),
        new THREE.Vector3(0.15, 0.25, 0)
    ]);
    const handleGeometry = new THREE.TubeGeometry(handleCurve, 12, 0.01, 8, false);
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.5,
        metalness: 0.4
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.name = "bucketHandle";
    heldBucketGroup.add(handle);
    
    // Create water mesh (initially invisible) - IMPROVED WATER VISIBILITY
    const waterGeometry = new THREE.CylinderGeometry(0.14, 0.11, 0.2, 16);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff, // Bright blue water
        emissive: 0x0044aa, // Add slight glow
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.position.y = 0.18; // Position water to be clearly visible at top of bucket
    waterMesh.visible = false; // Initially empty
    waterMesh.name = "bucketWater";
    heldBucketGroup.add(waterMesh);
    
    let rightHand = null;
    zowieCharacter.traverse(function(child) {
        if (child.name && (
            child.name.includes('RightHand') || 
            child.name.includes('Hand_R') || 
            child.name.includes('right_hand') ||
            child.name.includes('mixamorig:RightHand') ||
            child.name.includes('hand_r')
        )) {
            rightHand = child;
            console.log("Found hand bone for bucket:", child.name);
        }
    });
    
    if (rightHand) {
        const bucketContainer = new THREE.Group();
        rightHand.add(bucketContainer);
        
        // Center the bucket on the handle
        handle.geometry.computeBoundingBox();
        const handleCenter = handle.geometry.boundingBox.getCenter(new THREE.Vector3());
        heldBucketGroup.position.set(-handleCenter.x, -handleCenter.y, -handleCenter.z);
        bucketContainer.add(heldBucketGroup);
        
        // Position so the handle is in the hand, bucket hangs below
        bucketContainer.position.set(0, -0.2, 0); // Downward offset to hang below hand
        
        // Set rotation for upright bucket
        bucketContainer.rotation.set(Math.PI * 0.9, 0, 0); // Adjust rotation to keep bucket upright
        
        heldBucket = {
            originalBucket: bucket,
            heldMesh: heldBucketGroup,
            attachedTo: rightHand,
            container: bucketContainer,
            hasWater: false // Track if bucket has water
        };
    } else {
        console.log("Hand bone not found for bucket, using fallback positioning");
        zowieCharacter.add(heldBucketGroup);
        heldBucketGroup.position.set(0.2, 0.7, 0.3);
        heldBucketGroup.rotation.set(0, 0, 0); // Upright in fallback
        heldBucket = {
            originalBucket: bucket,
            heldMesh: heldBucketGroup,
            attachedTo: zowieCharacter,
            hasWater: false // Track if bucket has water
        };
    }
    
    console.log("Bucket picked up successfully in upright position!");
}

// Update the dropBucket function
function dropBucket() {
    if (!isCarryingBucket || !heldBucket) return;
    
    // Remove from wherever it was attached
    if (heldBucket.container) {
        heldBucket.attachedTo.remove(heldBucket.container);
    } else {
        heldBucket.attachedTo.remove(heldBucket.heldMesh);
    }
    
    // Make original bucket visible again, at Zowie's position
    const originalBucket = heldBucket.originalBucket;
    originalBucket.position.copy(zowieCharacter.position);
    // Place bucket slightly in front of Zowie
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(zowieCharacter.quaternion);
    originalBucket.position.add(direction.multiplyScalar(0.7));
    originalBucket.position.y = 0; // Set proper height
    originalBucket.visible = true;
    
    // If the bucket had water, we could create a water splash effect here
    if (heldBucket.hasWater) {
        console.log("Dropped bucket with water!");
        
        // Create a water splash effect (optional)
        createWaterSplash(originalBucket.position.clone());
    }
    
    isCarryingBucket = false;
    heldBucket = null;
    
    console.log("Bucket dropped successfully");
}

// Function to create a water splash effect
function createWaterSplash(position) {
    // Create a simple particle system for the splash
    const particleCount = 20;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
        const droplet = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0x4488aa,
                transparent: true,
                opacity: 0.7
            })
        );
        
        // Random position around the drop point
        droplet.position.copy(position);
        droplet.position.x += (Math.random() - 0.5) * 0.5;
        droplet.position.z += (Math.random() - 0.5) * 0.5;
        droplet.position.y += 0.1; // Start slightly above ground
        
        // Random velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            Math.random() * 0.1,
            (Math.random() - 0.5) * 0.05
        );
        
        droplet.userData.velocity = velocity;
        droplet.userData.lifetime = 1 + Math.random(); // 1-2 seconds
        
        particles.add(droplet);
    }
    
    scene.add(particles);
    
    // Animate the splash
    const animateSplash = () => {
        let allDone = true;
        
        particles.children.forEach(droplet => {
            // Apply velocity and gravity
            droplet.position.add(droplet.userData.velocity);
            droplet.userData.velocity.y -= 0.012; // Gravity
            
            // Check for ground collision to create splash
            if (droplet.position.y <= 0.05 && !droplet.userData.hasSplashed) {
                // Create splash at impact point - larger droplets make bigger splashes
                const isBigSplash = droplet.scale.x > 0.05 && Math.random() > 0.6;
                createSplashEffect(droplet.position.clone(), isBigSplash);
                droplet.userData.hasSplashed = true;
                droplet.visible = false;
            }
            
            // Reduce lifetime
            droplet.userData.lifetime -= 0.016; // Approx 1 frame at 60fps
            
            // Fade out
            if (droplet.material && droplet.material.opacity > 0) {
                droplet.material.opacity = Math.max(0, droplet.userData.lifetime / 2);
            }
            
            // Check if any particles are still alive
            if (droplet.userData.lifetime > 0 || !droplet.userData.hasSplashed) {
                allDone = false;
            }
        });
        
        // Continue animation or clean up
        if (!allDone) {
            requestAnimationFrame(animateSplash);
        } else {
            scene.remove(particles);
            particles.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
    };
    
    animateSplash();
}

// Function to fill bucket with water when near pond
function fillBucketWithWater() {
    if (!isCarryingBucket || !heldBucket || !isNearPond()) return;
    
    // If bucket already has water, do nothing
    if (heldBucket.hasWater) return;
    
    // Find the water mesh inside the bucket
    let waterMesh = null;
    heldBucket.heldMesh.traverse(function(child) {
        if (child.name === "bucketWater") {
            waterMesh = child;
        }
    });
    
    if (waterMesh) {
        // Make water visible with animation
        waterMesh.scale.set(1, 0.1, 1); // Start with flat water
        waterMesh.visible = true;
        
        // Animate water filling up
        const startTime = Date.now();
        const fillDuration = 1000; // 1 second fill animation
        
        const animateFill = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / fillDuration, 1);
            
            // Scale water up from bottom
            waterMesh.scale.y = progress;
            waterMesh.position.y = 0.1 + (progress * 0.08); // Adjust position as it fills
            
            if (progress < 1) {
                requestAnimationFrame(animateFill);
            } else {
                // Animation complete
                heldBucket.hasWater = true;
                
                // Add a ripple effect on the water surface
                const rippleInterval = setInterval(() => {
                    if (!isCarryingBucket || !heldBucket.hasWater) {
                        clearInterval(rippleInterval);
                        return;
                    }
                    
                    // Subtle scale animation for water surface
                    const ripple = {
                        scale: 0.98 + Math.random() * 0.04
                    };
                    
                    // Apply subtle ripple
                    waterMesh.scale.x = ripple.scale;
                    waterMesh.scale.z = ripple.scale;
                }, 500);
            }
        };
        
        animateFill();
        
        // Play a water collection sound if available
        // playSound('waterFill');
        
        console.log("Bucket filled with water!");
        
        // Display message to user
        displayText('Bucket filled with water!');
    }
}

function setupKeyboardControls() {
    // Initialize keys object
    keys = {};
    
    // Key down event
    document.addEventListener('keydown', function(event) {
        keys[event.key] = true;
    });
    
    // Key up event
    document.addEventListener('keyup', function(event) {
        keys[event.key] = false;
    });
}

// Function to throw water from the bucket
function throwWater() {
    if (!isCarryingBucket || !heldBucket || !heldBucket.hasWater) {
        console.log("Cannot throw water - conditions not met");
        return;
    }
    
    console.log("Throwing water!");
    displayText('Throwing water!');
    
    // Get water mesh
    let waterMesh = null;
    if (heldBucket.waterMesh) {
        waterMesh = heldBucket.waterMesh;
    } else {
        // Try to find water mesh in the bucket
        heldBucket.heldMesh.traverse(function(child) {
            if (child.name === "bucketWater" || child.name.includes("water")) {
                waterMesh = child;
                heldBucket.waterMesh = child; // Store for future reference
            }
        });
        
        // If still not found, create a simple water mesh
        if (!waterMesh) {
            console.log("Water mesh not found, creating a placeholder");
            const waterGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
            const waterMaterial = new THREE.MeshStandardMaterial({
                color: 0x4488aa,
                transparent: true,
                opacity: 0.8
            });
            waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
            waterMesh.name = "bucketWater";
            
            // Position inside the bucket
            if (heldBucket.heldMesh) {
                heldBucket.heldMesh.add(waterMesh);
                waterMesh.position.y = 0.15; // Adjust as needed
                heldBucket.waterMesh = waterMesh;
            }
        }
    }
    
    // Play throwing animation
    if (zowieThrowingAnimation) {
        // Stop current animation and play throwing animation
        if (currentZowieAnimation === 'idle' && zowieIdleAnimation) {
            zowieIdleAnimation.stop();
        } else if (currentZowieAnimation === 'walk' && zowieWalkAnimation) {
            zowieWalkAnimation.stop();
        }
        
        zowieThrowingAnimation.reset();
        zowieThrowingAnimation.play();
        
        // Store previous animation to return to later
        const previousAnimation = currentZowieAnimation;
        currentZowieAnimation = 'throwing';
        
        console.log("Playing throw animation");
        
        // Create water particles after animation reaches throwing point (around 1/3 of the way through)
        const waterReleaseTime = 2000; // Adjusted timing for when water should be released
        setTimeout(() => {
            if (!isCarryingBucket || !heldBucket) return; // Safety check
            
            // Calculate proper bucket position for particle origin
            const bucketPosition = new THREE.Vector3();
            if (waterMesh) {
                waterMesh.getWorldPosition(bucketPosition);
            } else {
                // Fallback to character position + offset
                bucketPosition.copy(zowieCharacter.position);
                bucketPosition.y += 1.0; // Approximate bucket height
            }
            
            // Make sure we're calculating the forward direction correctly
            const throwDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(zowieCharacter.quaternion);
            
            // Add a large forward offset to ensure water starts properly in front of character
            const forwardOffset = throwDirection.clone().multiplyScalar(1.5);
            bucketPosition.add(forwardOffset);
            
            console.log("Creating water particles");
            createWaterThrow(bucketPosition, throwDirection);
            
            // Hide bucket water
            if (waterMesh) waterMesh.visible = false;
            heldBucket.hasWater = false;
        }, waterReleaseTime);
        
        // Return to previous animation after throw is complete - give it more time
        const animationDuration = 2000; // Increased to 2 seconds to complete the animation
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
            console.log("Throw animation complete, returning to", previousAnimation);
        }, animationDuration);
    } else {
        console.error("Throwing animation not loaded!");
        // Still create water effect even if animation isn't available
        
        // Calculate proper bucket position for particle origin
        const bucketPosition = new THREE.Vector3();
        if (waterMesh) {
            waterMesh.getWorldPosition(bucketPosition);
        } else {
            bucketPosition.copy(zowieCharacter.position);
            bucketPosition.y += 1.0;
        }
        
        const throwDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(zowieCharacter.quaternion);
        const forwardOffset = throwDirection.clone().multiplyScalar(1.5);
        bucketPosition.add(forwardOffset);
        
        createWaterThrow(bucketPosition, throwDirection);
        
        setTimeout(() => {
            if (waterMesh) waterMesh.visible = false;
            heldBucket.hasWater = false;
        }, 300);
    }
    
    // Calculate where the water will land
    setTimeout(() => {
        // Calculate throw direction and landing position
        const throwDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(zowieCharacter.quaternion);
        
        const waterLandingPosition = new THREE.Vector3(
            zowieCharacter.position.x + throwDirection.x * 3,
            0,
            zowieCharacter.position.z + throwDirection.z * 3
        );
        
        console.log("Water landing position:", waterLandingPosition.toArray());
        
        // Check if any seed is close to where the water lands
        let nearestSeed = null;
        let shortestDistance = Infinity;
        
        // Find the closest seed to the water landing position
        for (let i = 0; i < seedsArray.length; i++) {
            const seed = seedsArray[i];
            const distance = waterLandingPosition.distanceTo(seed.position);
            
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestSeed = seed;
            }
        }
        
        console.log("Distance to nearest seed:", shortestDistance);
        
        // Use a generous buffer for water detection (8 units)
        const waterDetectionRadius = 8;
        
        if (nearestSeed && shortestDistance < waterDetectionRadius) {
            console.log("Watering seed successfully!");
            displayText('The pumpkin is growing!');
            
            // Grow pumpkin at the seed's position
            growPumpkin(nearestSeed.position.clone());
            
            // Remove the seed that grew into a pumpkin
            const seedIndex = seedsArray.indexOf(nearestSeed);
            if (seedIndex > -1) {
                seedsArray.splice(seedIndex, 1);
                scene.remove(nearestSeed);
            }
        } else {
            console.log("No seeds nearby to water");
        }
    }, 1000); // Check shortly after water is thrown
}

// Enhanced water throw function with more realistic water flow
function createWaterThrow(startPosition, direction) {
    console.log("Creating water throw particles at", startPosition.toArray());
    
    // Create a more cohesive stream system for the water throw
    const particleCount = 130; // More particles for smoother effect
    const particles = new THREE.Group();
    scene.add(particles);
    
    // Use Zowie's position directly as the throw start position
    const throwStartPos = zowieCharacter.position.clone();
    throwStartPos.y += 1.0; // Add height offset to position at roughly hand/bucket height
    
    // Create main water stream - coherent flow
    const streamCount = 40;
    const streamPoints = [];
    
    // Create arc path for main water stream
    for (let i = 0; i < 12; i++) {
        const t = i / 11; // 0 to 1
        // Create natural arc trajectory
        const arcX = throwStartPos.x + direction.x * t * 5.0;
        const arcY = throwStartPos.y + 0.25 - 5.8 * t * t; // Parabolic arc
        const arcZ = throwStartPos.z + direction.z * t * 4.5;
        streamPoints.push(new THREE.Vector3(arcX, Math.max(0.01, arcY), arcZ));
    }
    
    // Add main coherent stream
    for (let i = 0; i < streamCount; i++) {
        const pointIndex = Math.min(Math.floor(i / streamCount * 11), 10);
        const basePoint = streamPoints[pointIndex];
        
        const streamDrop = new THREE.Mesh(
            new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0x4488cc,
                transparent: true,
                opacity: 0.9,
                emissive: 0x1155aa,
                emissiveIntensity: 0.5
            })
        );
        
        // Position along the stream path with minimal variation for cohesion
        streamDrop.position.copy(basePoint);
        // Add slight variation for more natural look
        streamDrop.position.x += (Math.random() - 0.5) * 0.05 * (1 + pointIndex/5);
        streamDrop.position.y += (Math.random() - 0.5) * 0.05;
        streamDrop.position.z += (Math.random() - 0.5) * 0.05 * (1 + pointIndex/5);
        
        // Speed increases as water falls for realistic effect
        const pointProgress = pointIndex / 10;
        const speed = 0.15 + pointProgress * 0.15;
        
        const nextPointIndex = Math.min(pointIndex + 1, 11);
        const direction = new THREE.Vector3()
            .subVectors(streamPoints[nextPointIndex], basePoint)
            .normalize();
        
        const velocity = new THREE.Vector3(
            direction.x * speed + (Math.random() - 0.5) * 0.02,
            direction.y * speed - 0.01 * pointProgress, // Gravity influence increases with progress
            direction.z * speed + (Math.random() - 0.5) * 0.02
        );
        
        streamDrop.userData.velocity = velocity;
        streamDrop.userData.lifetime = 1.0 - pointProgress * 0.5 + Math.random() * 0.2;
        streamDrop.userData.hasSplashed = false;
        
        particles.add(streamDrop);
    }
    
    // Add scattered mist/spray around main stream
    for (let i = 0; i < particleCount - streamCount; i++) {
        const droplet = new THREE.Mesh(
            new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 6, 6),
            new THREE.MeshStandardMaterial({
                color: 0x6699cc,
                transparent: true,
                opacity: 0.7,
                emissive: 0x1155aa,
                emissiveIntensity: 0.2
            })
        );
        
        // Randomly position droplets along the stream path
        const pathPoint = Math.floor(Math.random() * 8); // First 8 points of the stream
        const basePoint = streamPoints[pathPoint].clone();
        
        // Add more variation for scattered spray
        const spreadFactor = 0.12 * (1 + pathPoint/4);
        droplet.position.copy(basePoint);
        droplet.position.x += (Math.random() - 0.5) * spreadFactor;
        droplet.position.y += (Math.random() - 0.5) * 0.05 + 0.05; // Slightly above stream
        droplet.position.z += (Math.random() - 0.5) * spreadFactor;
        
        // Slower, more scattered movement for spray/mist
        const speed = 0.05 + Math.random() * 0.1;
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            Math.random() * 0.05, // Small upward component for spray
            (Math.random() - 0.5) * 0.15
        );
        
        // Add influence of main stream direction
        velocity.x += direction.x * speed * 0.7;
        velocity.z += direction.z * speed * 0.7;
        
        droplet.userData.velocity = velocity;
        droplet.userData.lifetime = 0.8 + Math.random() * 0.6;
        droplet.userData.hasSplashed = false;
        
        particles.add(droplet);
    }
    
    // Animate the water throw
    const animateWaterThrow = () => {
        let allDone = true;
        
        particles.children.forEach(droplet => {
            // Apply velocity and gravity
            droplet.position.add(droplet.userData.velocity);
            droplet.userData.velocity.y -= 0.012; // Gravity
            
            // Check for ground collision to create splash
            if (droplet.position.y <= 0.05 && !droplet.userData.hasSplashed) {
                // Create splash at impact point - larger droplets make bigger splashes
                const isBigSplash = droplet.scale.x > 0.05 && Math.random() > 0.6;
                createSplashEffect(droplet.position.clone(), isBigSplash);
                droplet.userData.hasSplashed = true;
                droplet.visible = false;
            }
            
            // Reduce lifetime
            droplet.userData.lifetime -= 0.016; // Approx 1 frame at 60fps
            
            // Fade out
            if (droplet.material && droplet.material.opacity > 0) {
                droplet.material.opacity = Math.max(0, droplet.userData.lifetime / 2);
            }
            
            // Check if any particles are still alive
            if (droplet.userData.lifetime > 0 || !droplet.userData.hasSplashed) {
                allDone = false;
            }
        });
        
        // Continue animation or clean up
        if (!allDone) {
            requestAnimationFrame(animateWaterThrow);
        } else {
            scene.remove(particles);
            particles.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
    };
    
    animateWaterThrow();
}

// Enhanced splash effect with smooth wave-like ripples
function createSplashEffect(position, isLargeSplash = false) {
    const sizeFactor = isLargeSplash ? 1.5 : 1.0;
    const splashCount = isLargeSplash ? 16 : 10;
    const splashGroup = new THREE.Group();
    scene.add(splashGroup);
    
    // Create wave-like ripple effect
    const waveCount = isLargeSplash ? 3 : 2;
    const waves = [];
    
    for (let i = 0; i < waveCount; i++) {
        const wave = new THREE.Mesh(
            new THREE.CircleGeometry(0.1 * sizeFactor, 24),
            new THREE.MeshBasicMaterial({
                color: 0x4488aa,
                transparent: true,
                opacity: 0.5 - (i * 0.1),
                side: THREE.DoubleSide
            })
        );
        wave.rotation.x = -Math.PI / 2;
        wave.position.copy(position);
        wave.position.y = 0.01 + i * 0.005; // Stack slightly above each other
        wave.scale.set(0.1, 0.1, 0.1);
        wave.userData = {
            delay: i * 0.15, // Staggered start
            duration: 0.8 + i * 0.2,
            maxScale: 1.0 + i * 0.5,
            startTime: Date.now() + (i * 150) // Staggered start times
        };
        scene.add(wave);
        waves.push(wave);
    }
    
    // Add central splash "crown"
    const splashCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 0.15 * sizeFactor, 0.2 * sizeFactor, 16, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0x4488aa,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        })
    );
    splashCrown.position.copy(position);
    splashCrown.position.y = 0.1 * sizeFactor;
    splashGroup.add(splashCrown);
    splashCrown.userData.lifetime = 0.4;
    
    // Add droplets that fly outward
    for (let i = 0; i < splashCount; i++) {
        const splashDrop = new THREE.Mesh(
            new THREE.SphereGeometry(0.03 * sizeFactor + Math.random() * 0.02 * sizeFactor, 6, 6),
            new THREE.MeshStandardMaterial({
                color: 0x4488aa,
                transparent: true,
                opacity: 0.8,
                emissive: 0x1155aa,
                emissiveIntensity: 0.3
            })
        );
        
        // Position at impact point
        splashDrop.position.copy(position);
        splashDrop.position.y = 0.05;
        
        // Radial velocity with slight upward component for wave-like effect
        const angle = (Math.PI * 2 / splashCount) * i;
        const speed = 0.05 * sizeFactor + Math.random() * 0.03 * sizeFactor;
        
        const velocity = new THREE.Vector3(
            Math.cos(angle) * speed,
            0.08 * sizeFactor + Math.random() * 0.04 * sizeFactor, // Higher upward component
            Math.sin(angle) * speed
        );
        
        splashDrop.userData.velocity = velocity;
        splashDrop.userData.lifetime = 0.5 + Math.random() * 0.3;
        
        splashGroup.add(splashDrop);
    }
    
    // Animate the splash
    const animateSplash = () => {
        let allDone = true;
        
        // Animate the splash crown
        if (splashCrown.userData.lifetime > 0) {
            splashCrown.userData.lifetime -= 0.016;
            const progress = 1 - (splashCrown.userData.lifetime / 0.4);
            
            // Expand outward while shrinking upward
            splashCrown.scale.x = splashCrown.scale.z = 1 + progress * 0.5;
            splashCrown.scale.y = 1 - progress * 0.8;
            splashCrown.position.y = 0.1 * sizeFactor * (1 - progress * 0.5);
            splashCrown.material.opacity = Math.max(0, 0.7 - progress * 0.7);
            allDone = false;
        } else {
            splashCrown.visible = false;
        }
        
        splashGroup.children.forEach(drop => {
            if (drop === splashCrown) return;
            
            // Apply velocity and gravity
            drop.position.add(drop.userData.velocity);
            drop.userData.velocity.y -= 0.01 * sizeFactor;
            
            // Check for secondary ground impact - create mini-ripple
            if (drop.position.y <= 0.03 && drop.userData.velocity.y < 0) {
                drop.userData.velocity.y *= -0.3; // Bounce with damping
                drop.userData.velocity.x *= 0.7; // Friction
                drop.userData.velocity.z *= 0.7; // Friction
                drop.position.y = 0.03;
                
                // Create tiny ripple at secondary impact point
                if (Math.random() > 0.5) {
                    const miniRipple = new THREE.Mesh(
                        new THREE.CircleGeometry(0.05, 12),
                        new THREE.MeshBasicMaterial({
                            color: 0x4488aa,
                            transparent: true,
                            opacity: 0.3,
                            side: THREE.DoubleSide
                        })
                    );
                    miniRipple.rotation.x = -Math.PI / 2;
                    miniRipple.position.copy(drop.position);
                    miniRipple.position.y = 0.01;
                    scene.add(miniRipple);
                    
                    // Animate mini ripple
                    const startTime = Date.now();
                    const animateMiniRipple = () => {
                        const elapsed = (Date.now() - startTime) / 1000;
                        if (elapsed > 0.5) {
                            scene.remove(miniRipple);
                            miniRipple.geometry.dispose();
                            miniRipple.material.dispose();
                            return;
                        }
                        const scale = 0.05 + elapsed * 0.4;
                        miniRipple.scale.set(scale, scale, scale);
                        miniRipple.material.opacity = Math.max(0, 0.3 - elapsed * 0.6);
                        requestAnimationFrame(animateMiniRipple);
                    };
                    animateMiniRipple();
                }
                
                // Reduce lifetime on bounce
                drop.userData.lifetime *= 0.7;
            }
            
            // Reduce lifetime
            drop.userData.lifetime -= 0.016;
            
            // Fade out
            if (drop.material && drop.material.opacity > 0) {
                drop.material.opacity = Math.max(0, drop.userData.lifetime * 2);
            }
            
            // Scale down as lifetime decreases for natural fadeout
            const scale = Math.max(0.5, drop.userData.lifetime * 2);
            drop.scale.set(scale, scale, scale);
            
            if (drop.userData.lifetime > 0) {
                allDone = false;
            }
        });
        
        if (!allDone) {
            requestAnimationFrame(animateSplash);
        } else {
            scene.remove(splashGroup);
            splashGroup.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
    };
    
    animateSplash();
    
    // Animate the wave ripples
    const animateWaves = () => {
        let anyWaveActive = false;
        
        waves.forEach(wave => {
            const now = Date.now();
            if (now < wave.userData.startTime) {
                anyWaveActive = true;
                return;
            }
            
            const elapsed = (now - wave.userData.startTime) / 1000;
            if (elapsed > wave.userData.duration) {
                scene.remove(wave);
                wave.geometry.dispose();
                wave.material.dispose();
                return;
            }
            
            anyWaveActive = true;
            const progress = elapsed / wave.userData.duration;
            const easeOutProgress = 1 - Math.pow(1 - progress, 2); // Ease out
            
            // Smooth wave expansion
            const scale = wave.userData.maxScale * easeOutProgress;
            wave.scale.set(scale, scale, scale);
            
            // Fade out gradually
            wave.material.opacity = Math.max(0, (1 - progress) * 0.5);
        });
        
        if (anyWaveActive) {
            requestAnimationFrame(animateWaves);
        }
    };
    
    animateWaves();
}
