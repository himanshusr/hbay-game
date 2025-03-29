// Import the functions from terrain.js

// Environment elements
let sky, stars, ground, campusPaths, collegeBuildings, palmTrees, benches, balloons;

// Variables needed
var isCarryingSeed = false;
var heldSeed = null;
var pickupDistance = 2.0; // Adjust based on your game's scale
var seedsArray = []; // Will store all seed objects

// Keep track of key press states
var lastCKeyState = false;
var lastDKeyState = false;
var pickupCooldown = 0;
var lastFKeyState = false;
var lastTKeyState = false;

// Add these variables at the top of the file with other variables
var isCarryingBucket = false;
var heldBucket = null;
var bucket = null;
var pumpkinGrown = false; // Track if pumpkin has already grown
var pumpkinModel = null; // Store the pumpkin model

// Add this to the top with other variables
var dirtPatchObject = null;

// Initialize all environment elements
function setupEnvironment() {
    sky = createGradientSky();
    scene.add(sky);
    
    stars = createScatteredStars();
    
    ground = createGround();
    scene.add(ground);
    
    campusPaths = createCampusPaths();
    scene.add(campusPaths);
    
    collegeBuildings = createCollegeBuildings();
    scene.add(collegeBuildings);
    
    palmTrees = createPalmTrees();
    scene.add(palmTrees);
    
    benches = createBenches();
    scene.add(benches);
    
    // Removed balloons from initialization
    // balloons = createBalloons();
    // scene.add(balloons);
    
    // Create and add seeds
    const seeds = createSeeds();
    
    // Show/hide the C icon based on proximity to seeds
    cIcon = createCIcon();
    cIcon.position.set(22, 1.5, -15); // Position above the table
    scene.add(cIcon);
    cIcon.visible = false; // Initially hidden
    
    // Create D icon for dropping seeds
    dIcon = createDIcon();
    scene.add(dIcon);
    dIcon.visible = false; // Initially hidden
    
    const pond = createGhibliPond();
    scene.add(pond);
    
    // Add the dirt patch
    dirtPatchObject = createDirtPatch();
    scene.add(dirtPatchObject);

    // Add the red bucket
    const redBucket = createRedBucket();
    scene.add(redBucket);
    
    // Store the bucket for interaction
    bucket = redBucket;
}

// Campus ground
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x66bb6a,
        roughness: 0.8,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    return ground;
}

// Campus pathways
function createCampusPaths() {
    const pathGroup = new THREE.Group();
    
    const mainPathGeometry = new THREE.PlaneGeometry(8, 50);
    const pathMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0,
        roughness: 0.7,
        metalness: 0.0
    });
    const mainPath = new THREE.Mesh(mainPathGeometry, pathMaterial);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.y = 0.01;
    mainPath.receiveShadow = true;
    pathGroup.add(mainPath);
    
    const crossPathGeometry = new THREE.PlaneGeometry(30, 5);
    const crossPath = new THREE.Mesh(crossPathGeometry, pathMaterial);
    crossPath.rotation.x = -Math.PI / 2;
    crossPath.position.y = 0.01;
    crossPath.position.z = -10;
    crossPath.receiveShadow = true;
    pathGroup.add(crossPath);
    
    return pathGroup;
}

// Benches
function createBenches() {
    const benches = new THREE.Group();
    benches.add(createBench(-12, -5, 0));
    benches.add(createBench(12, -5, 0));
    benches.add(createBench(-5, -15, Math.PI / 2));
    benches.add(createBench(5, -15, -Math.PI / 2));
    return benches;
}

// Create individual bench
function createBench(x, z, rotation) {
    const group = new THREE.Group();
    
    const seatGeometry = new THREE.BoxGeometry(3, 0.2, 1);
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.9
    });
    const seat = new THREE.Mesh(seatGeometry, woodMaterial);
    seat.position.y = 0.6;
    seat.castShadow = true;
    group.add(seat);
    
    const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 1);
    for (let i = -1; i <= 1; i += 2) {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(i * 1.2, 0.3, 0);
        leg.castShadow = true;
        group.add(leg);
    }
    
    const backGeometry = new THREE.BoxGeometry(3, 1, 0.2);
    const back = new THREE.Mesh(backGeometry, woodMaterial);
    back.position.set(0, 1.1, -0.4);
    back.castShadow = true;
    group.add(back);
    
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    return group;
}

// Balloons (function left in place but not used)
function createBalloons() {
    // Return empty group instead of creating balloons
    return new THREE.Group();
}

// Function to check Zowie's proximity to the seeds
function checkZowieProximity(zowiePosition, seedPosition, threshold) {
    const distance = zowiePosition.distanceTo(seedPosition);
    return distance < threshold;
}


// Function to create seeds and store them in seedsArray
function createSeeds() {
    const seedGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const seedMaterial = new THREE.MeshStandardMaterial({
        color: 0x728C00, // Green color
        roughness: 0.5,
        metalness: 0.2
    });
    
    // Create a group for all seeds
    const seedsGroup = new THREE.Group();
    
    // Position of the table (where seeds are)
    const tablePosition = new THREE.Vector3(22, 0, -15);
    
    for (let i = 0; i < 6; i++) {
        const seed = new THREE.Mesh(seedGeometry, seedMaterial);
        seed.scale.set(1.5, 0.3, 1); // Oval and flat shape
        
        // Increase randomization range for wider scattering
        const xOffset = (Math.random() - 0.5) * 0.6; // Wider range
        const zOffset = (Math.random() - 0.5) * 0.6; // Wider range
        seed.position.set(tablePosition.x + xOffset, tablePosition.y + 0.96, tablePosition.z + zOffset);
        
        // Add subtle rotation for a more natural look
        seed.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Add a slight variation in color for each seed
        seed.material = seedMaterial.clone();
        seed.material.color.setHSL(
            0.3, // Hue for green
            0.5 + Math.random() * 0.1, // Saturation
            0.4 + Math.random() * 0.1 // Lightness
        );
        
        // Add to scene and store in seedsArray
        seedsGroup.add(seed);
        seedsArray.push(seed);
    }
    
    scene.add(seedsGroup);
    return seedsGroup;
}

// Function to handle seed and bucket interaction with keyboard
function handleSeedInteraction() {
    // Handle pickup cooldown
    if (pickupCooldown > 0) {
        pickupCooldown--;
        return;
    }
    
    // Check current key states
    const cKeyPressed = keys['c'] || keys['C'];
    const dKeyPressed = keys['d'] || keys['D'];
    const fKeyPressed = keys['f'] || keys['F'];
    const tKeyPressed = keys['t'] || keys['T'];
    
    // C key for pickup
    if (cKeyPressed && !lastCKeyState) {
        if (!isCarryingSeed && !isCarryingBucket) {
            // First check if near bucket
            if (isNearBucket()) {
                pickupBucket();
                pickupCooldown = 10; // Prevent multiple pickups
            } 
            // Then check for seeds
            else {
                tryPickupSeed();
                pickupCooldown = 10;
            }
        }
    }
    
    // D key for dropping
    if (dKeyPressed && !lastDKeyState) {
        if (isCarryingSeed) {
            dropSeed();
            pickupCooldown = 10;
        } else if (isCarryingBucket) {
            dropBucket();
            pickupCooldown = 10;
        }
    }
    
    // F key for filling bucket with water
    if (fKeyPressed && !lastFKeyState && isCarryingBucket && isNearPond() && !heldBucket.hasWater) {
        fillBucketWithWater();
        pickupCooldown = 10;
    }
    
    // T key for throwing water
    if (tKeyPressed && !lastTKeyState && isCarryingBucket && heldBucket.hasWater) {
        throwWater();
        pickupCooldown = 20; // Longer cooldown for throwing animation
    }
    
    // Update last key states
    lastCKeyState = cKeyPressed;
    lastDKeyState = dKeyPressed;
    lastFKeyState = fKeyPressed;
    lastTKeyState = tKeyPressed;
}

// Try to pick up a seed near Zowie
function tryPickupSeed() {
    if (!zowieCharacter) return;
    
    const zowiePosition = zowieCharacter.position.clone();
    console.log("Zowie position:", zowiePosition);
    console.log("Number of seeds:", seedsArray.length);
    
    // Only try picking up if there are seeds available
    if (seedsArray.length === 0) {
        console.log("No seeds available to pick up");
        return;
    }
    
    // Sort seeds by distance to pick closest one first
    seedsArray.sort((a, b) => {
        const distA = zowiePosition.distanceTo(a.position);
        const distB = zowiePosition.distanceTo(b.position);
        return distA - distB;
    });
    
    // Check the closest seed
    const closestSeed = seedsArray[0];
    const distance = zowiePosition.distanceTo(closestSeed.position);
    
    console.log("Distance to closest seed: " + distance);
    
    // Use a slightly larger pickup distance for better usability
    if (distance <= pickupDistance * 1.2) {
        console.log("Picking up seed at distance: " + distance);
        pickupSeed(closestSeed);
    } else {
        console.log("No seeds within pickup distance");
    }
}

// Pick up a seed
function pickupSeed(seed) {
    isCarryingSeed = true;
    heldSeed = seed;
    
    // Remove from seedsArray (to avoid picking up the same seed twice)
    const index = seedsArray.indexOf(seed);
    if (index > -1) {
        seedsArray.splice(index, 1);
    }
    
    // Hide the seed in its original position
    seed.visible = false;
    
    // Create a new mesh for the held seed
    const heldSeedGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const heldSeedMaterial = seed.material.clone();
    const heldSeedMesh = new THREE.Mesh(heldSeedGeometry, heldSeedMaterial);
    heldSeedMesh.scale.set(1.5, 0.3, 1);
    
    // Find Zowie's right hand bone
    let rightHand = null;
    zowieCharacter.traverse(function(child) {
        // Look for common hand bone names in FBX models
        if (child.name && (
            child.name.includes('RightHand') || 
            child.name.includes('Hand_R') || 
            child.name.includes('right_hand') ||
            child.name.includes('mixamorig:RightHand') ||
            child.name.includes('hand_r')
        )) {
            rightHand = child;
            console.log("Found hand bone:", child.name);
        }
    });
    
    // If we found the hand bone, attach to it
    if (rightHand) {
        rightHand.add(heldSeedMesh);
        // Position in palm of hand
        heldSeedMesh.position.set(0, 0.01, 0.04);
        // Rotate to fit in palm
        heldSeedMesh.rotation.set(Math.PI/2, 0, 0);
    } else {
        // Fallback: attach to character and position offset to approximate hand position
        console.log("Hand bone not found, using fallback positioning");
        zowieCharacter.add(heldSeedMesh);
        heldSeedMesh.position.set(0.15, 0.7, 0.3); // Adjusted to be more visible in hand position
    }
    
    heldSeed = {
        originalSeed: seed,
        heldMesh: heldSeedMesh,
        attachedTo: rightHand || zowieCharacter
    };
    
    console.log("Seed picked up successfully");
}

// Drop the held seed
function dropSeed() {
    if (!isCarryingSeed || !heldSeed) return;
    
    // Remove from wherever it was attached
    heldSeed.attachedTo.remove(heldSeed.heldMesh);
    
    // Make original seed visible again, at Zowie's position
    const seed = heldSeed.originalSeed;
    seed.position.copy(zowieCharacter.position);
    // Place seed slightly in front of Zowie
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(zowieCharacter.quaternion);
    seed.position.add(direction.multiplyScalar(0.5));
    seed.position.y = 0.96; // Set proper height
    seed.visible = true;
    
    // Add back to seedsArray
    seedsArray.push(seed);
    
    isCarryingSeed = false;
    heldSeed = null;
    
    console.log("Seed dropped successfully at position:", seed.position.toArray());
    displayText('Seed dropped. Water it to grow a pumpkin!');
}

// Update function to check Zowie's position and show/hide the "C" icon
function updateEnvironment() {
    if (!zowieCharacter) return;
    
    const zowiePosition = zowieCharacter.position.clone();
    
    // Calculate if Zowie is near any seed
    let nearAnySeed = false;
    let closestDistance = Infinity;
    
    // Find the closest seed
    for (let i = 0; i < seedsArray.length; i++) {
        const seed = seedsArray[i];
        const distance = zowiePosition.distanceTo(seed.position);
        if (distance < closestDistance) {
            closestDistance = distance;
        }
    }
    
    // Near seeds if closest seed is within pickup distance
    nearAnySeed = closestDistance <= pickupDistance * 1.2;
    
    // Check if near bucket
    const nearBucket = isNearBucket();
    
    // Check if near pond
    const nearPond = isNearPond();
    
    // Update icons visibility
    if (cIcon && dIcon) {
        // C icon shown when near seeds or bucket and not carrying anything
        if (!isCarryingSeed && !isCarryingBucket && (nearAnySeed || nearBucket)) {
            cIcon.visible = true;
            dIcon.visible = false;
            
            // Position the C icon at the top right of the screen
            cIcon.position.set(
                window.innerWidth - 50,
                50,
                0
            );
            
            // Display text instruction
            if (nearBucket) {
                displayText('Press C to pick up bucket');
            } else {
                displayText('Press C to collect seed');
            }
        } 
        // F key instruction when near pond with bucket
        else if (isCarryingBucket && nearPond && !heldBucket.hasWater) {
            cIcon.visible = false;
            dIcon.visible = false;
            
            // Display text instruction for filling bucket
            displayText('Press F to fill bucket with water');
        }
        // D icon shown when carrying a seed or bucket
        else if (isCarryingSeed || isCarryingBucket) {
            cIcon.visible = false;
            dIcon.visible = true;
            
            // Position the D icon at the top right of the screen
            dIcon.position.set(
                window.innerWidth - 50,
                50,
                0
            );
            
            // Display text instruction
            if (isCarryingBucket) {
                if (heldBucket.hasWater) {
                    displayText('Press D to drop bucket with water, T to throw water');
                } else {
                    displayText('Press D to drop bucket');
                }
            } else {
                displayText('Press D to drop seed');
            }
        }
        // Hide both when not near interactive objects and not carrying
        else {
            cIcon.visible = false;
            dIcon.visible = false;
            displayText(''); // Clear text
        }
    }
    
    // Handle key press for seed and bucket interaction
    handleSeedInteraction();
    
    // Animate water in the pond
    scene.traverse(function(object) {
        if (object.isWater) {
            object.update();
        }
    });
}

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

// Helper function to apply during animation to maintain bucket upright
function updateGame() {
    // If we're carrying the bucket, keep it upright
    if (isCarryingBucket && heldBucket && heldBucket.container) {
        // Most FBX models maintain a consistent hand orientation in animations
        // So a fixed rotation will often work well
        
        // Ensure bucket stays vertical - this can be tuned as needed
        heldBucket.heldMesh.rotation.set(-Math.PI , 0, 0);
        
        // Adjust container rotation to keep handle in palm
        // This might need tweaking based on the specific model and animations
        // heldBucket.container.rotation.set(0, Math.PI/4, 0);
        // heldBucket.heldMesh.rotation.set(-Math.PI / 2, 0, 0);
    }
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
            droplet.userData.velocity.y -= 0.003; // Gravity
            
            // Reduce lifetime
            droplet.userData.lifetime -= 0.016; // Approx 1 frame at 60fps
            
            // Fade out
            if (droplet.material.opacity > 0) {
                droplet.material.opacity = Math.max(0, droplet.userData.lifetime / 2);
            }
            
            // Check if any particles are still alive
            if (droplet.userData.lifetime > 0) {
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
        if (!pumpkinGrown) {
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
        } else {
            console.log("Pumpkin already grown");
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

// Function to load and display the pumpkin - with improved positioning and size
function growPumpkin(position) {
    if (pumpkinGrown) {
        console.log("Pumpkin already grown, not growing another");
        return;
    }
    
    console.log("Starting to grow pumpkin at", position.toArray());
    pumpkinGrown = true;
    
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
            
            // Calculate initial and final scales
            const initialScale = 0.001;
            const finalScale = 0.09 + Math.random() * 0.005;
            
            // Calculate proper y-offset based on scale to keep bottom at ground level
            // This value might need adjustment based on the specific pumpkin model
            const baseYOffset = 0.5;  // Base offset for the pumpkin
            const yScaleFactor = 100;  // Multiplier that adjusts how much Y increases with scale
            
            // Start small
            object.scale.set(initialScale, initialScale, initialScale);
            object.position.y = baseYOffset * initialScale * yScaleFactor;
            
            // Add to scene
            scene.add(object);
            pumpkinModel = object;
            
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
                    
                    requestAnimationFrame(animateGrowth);
                } else {
                    // Final position and rotation
                    object.position.y = baseYOffset * finalScale * yScaleFactor;
                    object.rotation.y = Math.random() * Math.PI * 2; // Random final rotation
                    
                    displayText('Your pumpkin has grown!');
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
            pumpkinGrown = false; // Reset so player can try again
        }
    );
}

// Update the createDirtPatch function to return the correct position
function createDirtPatch() {
    const dirtPatchGroup = new THREE.Group();
    
    // Create the base of the dirt patch
    const dirtGeometry = new THREE.CircleGeometry(2, 32);
    const dirtMaterial = new THREE.MeshStandardMaterial({
        color: 0x5d4037, // Brown color
        roughness: 0.9,
        metalness: 0.1
    });
    const dirtPatch = new THREE.Mesh(dirtGeometry, dirtMaterial);
    dirtPatch.rotation.x = -Math.PI / 2; // Rotate to lie flat
    dirtPatch.position.y = 0.01; // Slightly above ground to avoid z-fighting
    dirtPatchGroup.add(dirtPatch);
    
    // Add a subtle bump to the dirt
    const bumpGeometry = new THREE.CircleGeometry(1.8, 32);
    const bumpMaterial = new THREE.MeshStandardMaterial({
        color: 0x3e2723, // Darker brown
        roughness: 1.0,
        metalness: 0.0
    });
    const bump = new THREE.Mesh(bumpGeometry, bumpMaterial);
    bump.rotation.x = -Math.PI / 2;
    bump.position.y = 0.05;
    dirtPatchGroup.add(bump);
    
    // Position the dirt patch
    const dirtPatchPosition = new THREE.Vector3(10, 0, -8);
    dirtPatchGroup.position.copy(dirtPatchPosition);
    
    // Store the position for reference
    dirtPatchGroup.userData.position = dirtPatchPosition;
    
    // Debug: Add a visible marker above the dirt patch
    const markerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.y = 2; // Position above the dirt patch
    marker.visible = false; // Only make visible for debugging if needed
    dirtPatchGroup.add(marker);
    
    return dirtPatchGroup;
}