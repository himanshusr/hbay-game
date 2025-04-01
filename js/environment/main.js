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
var lastPKeyState = false; // Track P key for punching pumpkins
var lastUKeyState = false; // Track U key for unlocking door

// Add these variables at the top of the file with other variables
var isCarryingBucket = false;
var heldBucket = null;
var bucket = null;
var pumpkinGrown = false; // Track if pumpkin has already grown
var pumpkinModel = null; // Store the pumpkin model
var pumpkins = []; // Array to store all grown pumpkins

// Add this to the top with other variables
var dirtPatchObject = null;

// Add a global variable to track punchable pumpkins
var punchablePumpkins = [];

// Add global variable for the collectible key
var collectibleKey = null; 
var isCarryingKey = false;
var heldKey = null; // Add this variable to store the key object when held

// Make pumpkins array global
window.pumpkins = []; 

// --- Add references to global touch flags (defined in controls.js) ---
// Ensure controls.js is loaded before this file, or pass flags differently.
// Assuming global scope for simplicity here:
// extern let touchActionPickup, touchActionDrop, touchActionFill, touchActionThrow, touchActionPunch, touchActionUnlock;

// --- Get Button Elements (ideally once in init, but here for simplicity) ---
let btnPickupElement, btnDropElement, btnFillElement, btnThrowElement, btnPunchElement, btnUnlockElement;

function cacheButtonElements() {
    btnPickupElement = document.getElementById('btn-pickup');
    btnDropElement = document.getElementById('btn-drop');
    btnFillElement = document.getElementById('btn-fill');
    btnThrowElement = document.getElementById('btn-throw');
    btnPunchElement = document.getElementById('btn-punch');
    btnUnlockElement = document.getElementById('btn-unlock');
}

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

// Function to find the closest seed within pickup distance
function findClosestSeed() {
    if (!zowieCharacter || typeof seedsArray === 'undefined' || seedsArray.length === 0) {
        return null; // Cannot find if character or seeds don't exist
    }

    let closestSeed = null;
    let minDistanceSq = pickupDistance * pickupDistance; // Use squared distance for efficiency

    const zowiePosition = zowieCharacter.position;

    for (let i = 0; i < seedsArray.length; i++) {
        const seed = seedsArray[i];
        if (seed && seed.parent) { // Check if seed exists and is in the scene
            const distanceSq = zowiePosition.distanceToSquared(seed.position);

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestSeed = seed;
            }
        }
    }

    return closestSeed; // Returns the seed object or null
}

// Helper function to check if Zowie is near the collectible key
function isNearKey() {
    if (!zowieCharacter || !collectibleKey || !collectibleKey.parent) {
        // *** ADD LOG ***
        // console.log("isNearKey: Preconditions not met (No Zowie, Key, or Key not in scene). Key:", collectibleKey); 
        return false;
    }
    const zowiePosition = zowieCharacter.position.clone();
    const keyPosition = collectibleKey.position.clone();
    const distance = zowiePosition.distanceTo(keyPosition);
    // *** ADD LOG ***
    console.log(`isNearKey: Distance=${distance.toFixed(2)}, PickupThreshold=${pickupDistance}`); 
    return distance <= pickupDistance; 
}

// Helper function to check if Zowie is near the keyhole area
function isNearKeyhole() {
    if (!zowieCharacter) return false;
    const zowiePosition = zowieCharacter.position.clone();
    // Define the approximate position in front of the keyhole on the main building
    // The building is at z = -30, keyhole is at z = -22.95. Let's use z = -22 for interaction.
    const keyholeInteractionPoint = new THREE.Vector3(0, 0, -22);
    const unlockDistanceThreshold = 3.0; // How close Zowie needs to be

    const distance = zowiePosition.distanceTo(keyholeInteractionPoint);
    // console.log(`Distance to keyhole: ${distance.toFixed(2)}`); // Optional: for debugging
    return distance <= unlockDistanceThreshold;
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

// Modified handleSeedInteraction
// References js/environment/main.js startLine: 272 endLine: 403
function handleSeedInteraction() {
    // Handle pickup cooldown
    if (pickupCooldown > 0) {
        pickupCooldown--;
        // --- Reset flags even during cooldown ---
        touchActionPickup = false;
        touchActionDrop = false;
        touchActionFill = false;
        touchActionThrow = false;
        touchActionPunch = false;
        touchActionUnlock = false;
        // --- End Reset ---
        return;
    }

    // Check actions based on keys OR touch flags
    const pKeyPressed = keys['p'] || keys['P'] || touchActionPunch;
    const cKeyPressed = keys['c'] || keys['C'] || touchActionPickup;
    const dKeyPressed = keys['d'] || keys['D'] || touchActionDrop;
    const fKeyPressed = keys['f'] || keys['F'] || touchActionFill;
    const tKeyPressed = keys['t'] || keys['T'] || touchActionThrow;
    const uKeyPressed = keys['u'] || keys['U'] || touchActionUnlock;

    // --- Punching ---
    if (pKeyPressed && !lastPKeyState) { // Use lastPKeyState to prevent holding
        const nearbyPumpkin = findNearbyPumpkin();
        if (nearbyPumpkin) {
            punchPumpkin(nearbyPumpkin);
            pickupCooldown = 20;
        }
    }
    lastPKeyState = (keys['p'] || keys['P']); // Update keyboard state tracking

    // --- Unlocking ---
    if (uKeyPressed && !lastUKeyState) { // Use lastUKeyState
        if (isCarryingKey && isNearKeyhole()) {
            unlockDoor();
            pickupCooldown = 10;
        }
    }
    lastUKeyState = (keys['u'] || keys['U']); // Update keyboard state tracking

    // --- Picking up Seed ---
    if (cKeyPressed && !lastCKeyState) { // Use lastCKeyState
        if (!isCarryingSeed && !isCarryingBucket && !isCarryingKey) {
            const closestSeed = findClosestSeed();
            if (closestSeed) {
                pickupSeed(closestSeed);
                pickupCooldown = 10;
            } else {
                 // --- Picking up Key --- (Combine C key logic)
                 if (isNearKey()) {
                     pickupKey(); // Assumes pickupKey is defined
                     pickupCooldown = 10;
                 } else {
                     // --- Picking up Bucket --- (Combine C key logic)
                     if (isNearBucket() && !isCarryingBucket) {
                         pickupBucket(); // Assumes pickupBucket is defined
                         pickupCooldown = 10;
                     }
                 }
            }
        }
    }
    lastCKeyState = (keys['c'] || keys['C']); // Update keyboard state tracking


    // --- Dropping Item ---
    if (dKeyPressed && !lastDKeyState) { // Use lastDKeyState
        if (isCarryingSeed) {
            dropSeed();
            pickupCooldown = 10;
        } else if (isCarryingBucket) {
            dropBucket();
            pickupCooldown = 10;
        } else if (isCarryingKey) {
            dropKey();
            pickupCooldown = 10;
        }
    }
    lastDKeyState = (keys['d'] || keys['D']); // Update keyboard state tracking

    // --- Filling Bucket ---
    if (fKeyPressed && !lastFKeyState) { // Use lastFKeyState
        if (isCarryingBucket && !heldBucket.hasWater && isNearPond()) {
            fillBucket();
            pickupCooldown = 10;
        }
    }
    lastFKeyState = (keys['f'] || keys['F']); // Update keyboard state tracking

    // --- Throwing Water ---
    if (tKeyPressed && !lastTKeyState) { // Use lastTKeyState
        if (isCarryingBucket && heldBucket.hasWater) {
            // References js/environment/bucket.js startLine: 412 endLine: 594
            throwWater(); // Assumes throwWater is defined
            pickupCooldown = 30; // Longer cooldown for throwing
        }
    }
    lastTKeyState = (keys['t'] || keys['T']); // Update keyboard state tracking


    // --- Reset Touch Flags at the end of processing ---
    touchActionPickup = false;
    touchActionDrop = false;
    touchActionFill = false;
    touchActionThrow = false;
    touchActionPunch = false;
    touchActionUnlock = false;
    // --- End Reset ---
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

// *** Add pickupKey function ***
// function pickupKey() {
//     if (!collectibleKey || !collectibleKey.parent || !zowieCharacter) return; 

//     console.log("Picking up key");
    
//     heldKey = collectibleKey; 
    
//     // *** Store the original scale before removing from scene ***
//     if (!heldKey.userData.originalScale) { // Store only if not already stored
//         heldKey.userData.originalScale = heldKey.scale.clone();
//         console.log("Stored original key scale:", heldKey.userData.originalScale);
//     }
    
//     scene.remove(heldKey); 
    
//     let handBone = null;
//     zowieCharacter.traverse((child) => {
//         // Use a more general check for the right hand bone
//         if (child.isBone && child.name.toLowerCase().includes('righthand')) { 
//             handBone = child;
//             console.log("Found hand bone:", handBone.name); // Log the actual name found
//         }
//     });

//     if (handBone) {
//         console.log("Attaching key to hand bone:", handBone.name);
//         handBone.add(heldKey); 
        
//         // Try these new position values to place the key directly on the hand
//         heldKey.position.set(0, 0, 0); 
        
//         // You may also need to adjust the rotation
//         heldKey.rotation.set(0, 0, 0); 
        
//         // You might need to adjust the scale as well
//         const heldScale = 0.001; // Try a smaller scale
//         heldKey.scale.set(heldScale, heldScale, heldScale);
//         console.log("Set held key scale:", heldKey.scale);
//     } else {
//         console.error("Could not find hand bone to attach key!");
//         // If attachment fails, restore original scale if we stored it
//         if (heldKey.userData.originalScale) {
//              heldKey.scale.copy(heldKey.userData.originalScale);
//         }
//         // Re-add to scene if attachment fails
//         scene.add(heldKey); // Add it back to the scene at its last position
//         heldKey = null; // Don't consider it held
//         // collectibleKey remains the original object in the scene
//         isCarryingKey = false; // Ensure state reflects failure
//         return; // Exit the function early
//     }

//     // Only nullify collectibleKey and set isCarryingKey if attachment succeeded
//     collectibleKey = null; 
//     isCarryingKey = true; 

//     displayText('Key collected!'); 
// }
function pickupKey() {
    if (!collectibleKey || !collectibleKey.parent || !zowieCharacter) return; 

    console.log("Picking up key");
    
    heldKey = collectibleKey; 
    
    if (!heldKey.userData.originalScale) {
        heldKey.userData.originalScale = heldKey.scale.clone();
        console.log("Stored original key scale:", heldKey.userData.originalScale);
    }
    
    scene.remove(heldKey); 
    
    // Instead of finding the hand bone, attach directly to Zowie
    zowieCharacter.add(heldKey);
    
    // Position the key on top of Zowie's head
    // Adjust these values based on your character's height and scale
    heldKey.position.set(0, 1.8, 0); // Y value controls height above head
    
    // Set rotation to make key look good on head
    heldKey.rotation.set(0, Math.PI/4, 0); // Slight angle for visibility
    
    // Adjust scale to be appropriate for head placement
    const heldScale = 0.01; // Adjust as needed
    heldKey.scale.set(heldScale, heldScale, heldScale);
    console.log("Set held key scale:", heldKey.scale);

    collectibleKey = null; 
    isCarryingKey = true; 
    displayText('Key collected!'); 
}
// *** Add dropKey function ***
function dropKey() {
    if (!isCarryingKey || !heldKey || !zowieCharacter) return; 

    console.log("Dropping key");

    let handBone = null;
    zowieCharacter.traverse((child) => {
        if (child.isBone && child.name === 'mixamorigRightHand') { 
            handBone = child;
        }
    });

    // *** Restore original scale BEFORE detaching/re-adding ***
    if (heldKey.userData.originalScale) {
        console.log("Restoring original key scale:", heldKey.userData.originalScale);
        heldKey.scale.copy(heldKey.userData.originalScale);
    } else {
        // Fallback if original scale wasn't stored (shouldn't happen ideally)
        const defaultScale = 0.05; // The scale set when the key was first created
        heldKey.scale.set(defaultScale, defaultScale, defaultScale);
        console.warn("Original key scale not found, resetting to default.");
    }

    if (handBone) {
        handBone.remove(heldKey); 
    } else {
        console.error("Could not find hand bone to detach key from!");
    }

    scene.add(heldKey);

    // Position the key on the ground in front of Zowie
    const dropPosition = zowieCharacter.position.clone();
    const forward = new THREE.Vector3();
    zowieCharacter.getWorldDirection(forward); 
    dropPosition.add(forward.multiplyScalar(1.0)); 
    dropPosition.y = 0.1; 
    
    heldKey.position.copy(dropPosition);
    heldKey.rotation.set(0, Math.random() * Math.PI * 2, 0); 

    collectibleKey = heldKey; 
    
    // Restart the bobbing/rotating animation
    (function animateKeyCompletely() {
        if (!collectibleKey || !collectibleKey.parent) return; // Stop if picked up again or removed
        
        collectibleKey.rotation.y += 0.02;
        const time = Date.now() * 0.002;
        // Use the key's current ground position as the base for bobbing
        const basePosY = 0.1; // The Y position we set when dropping
        collectibleKey.position.y = basePosY + Math.sin(time) * 0.1; 
        
        requestAnimationFrame(animateKeyCompletely);
    })();
    console.log("Restarted key bobbing animation.");

    heldKey = null; 
    isCarryingKey = false;

    displayText('Key dropped.'); 
}

// Modified updateEnvironment to control button visibility
// References js/environment/main.js startLine: 648 endLine: 681
function updateEnvironment() {
    if (!zowieCharacter) return;

    // Ensure button elements are cached
    if (!btnPickupElement) {
        cacheButtonElements();
    }

    const zowiePosition = zowieCharacter.position.clone();
    let instruction = ''; // For desktop text

    // --- Hide all buttons initially ---
    if (isMobile) { // Only manipulate buttons on mobile
        if (btnPickupElement) btnPickupElement.style.display = 'none';
        if (btnDropElement) btnDropElement.style.display = 'none';
        if (btnFillElement) btnFillElement.style.display = 'none';
        if (btnThrowElement) btnThrowElement.style.display = 'none';
        if (btnPunchElement) btnPunchElement.style.display = 'none';
        if (btnUnlockElement) btnUnlockElement.style.display = 'none';
    }

    // --- Determine Context and Show Buttons/Text ---

    // 1. Punching (Highest Priority?)
    // References js/environment/main.js startLine: 657 endLine: 659
    const nearbyPumpkin = findNearbyPumpkin();
    if (nearbyPumpkin) {
        instruction = 'Press P to punch!';
        if (isMobile && btnPunchElement) btnPunchElement.style.display = 'flex';
    } else {
        // 2. Unlocking (If carrying key near keyhole)
        const nearKeyhole = isNearKeyhole();
        if (isCarryingKey && nearKeyhole) {
            instruction = 'Press U to unlock!';
            if (isMobile && btnUnlockElement) btnUnlockElement.style.display = 'flex';
        }
        // 3. Interactions with items Zowie is NOT carrying
        else if (!isCarryingSeed && !isCarryingBucket && !isCarryingKey) {
            const closestSeed = findClosestSeed();
            const nearKey = isNearKey();
            const nearBucket = isNearBucket();

            if (closestSeed) {
                instruction = 'Press C to pick up seed';
                if (isMobile && btnPickupElement) btnPickupElement.style.display = 'flex';
            } else if (nearKey) {
                instruction = 'Press C to pick up key';
                if (isMobile && btnPickupElement) btnPickupElement.style.display = 'flex';
            } else if (nearBucket) {
                instruction = 'Press C to pick up bucket';
                if (isMobile && btnPickupElement) btnPickupElement.style.display = 'flex';
            }
        }
        // 4. Interactions when carrying the Bucket
        else if (isCarryingBucket) {
            const nearPond = isNearPond();
            if (heldBucket && !heldBucket.hasWater && nearPond) {
                instruction = 'Press F to fill bucket';
                if (isMobile && btnFillElement) btnFillElement.style.display = 'flex';
            } else if (heldBucket && heldBucket.hasWater) {
                instruction = 'Press T to throw water';
                if (isMobile && btnThrowElement) btnThrowElement.style.display = 'flex';
            }
            // Always allow dropping the bucket if carrying it
            if (isMobile && btnDropElement) btnDropElement.style.display = 'flex';
            if (!instruction) instruction = 'Press D to drop bucket'; // Add drop text if no other action

        }
        // 5. Interactions when carrying Seed or Key (Drop only)
        else if (isCarryingSeed || isCarryingKey) {
             instruction = 'Press D to drop item';
             if (isMobile && btnDropElement) btnDropElement.style.display = 'flex';
        }
    }


    // Update instruction text display (for desktop)
    // References js/utils.js startLine: 1 endLine: 10 (displayText function)
    if (typeof displayText === 'function') {
        displayText(instruction);
    } else {
        // Fallback if displayText isn't available
        const instructionElement = document.getElementById('instructionText');
        if (instructionElement) {
            instructionElement.textContent = instruction;
        }
    }

    // --- Other environment updates ---
    // (Pumpkin growth, etc.)
    // References js/environment/pumpkin.js startLine: 100 endLine: 147 (updatePumpkins)
    if (typeof updatePumpkins === 'function') {
        updatePumpkins();
    }
    // References js/environment/main.js startLine: 192 endLine: 204 (updateGame - bucket upright)
    if (typeof updateGame === 'function') {
        updateGame(); // Keep bucket upright if carrying
    }
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

function unlockDoor() {
    if (!isCarryingKey || !heldKey) {
        console.error("Unlock attempt failed: Not carrying key or heldKey is invalid.");
        return;
    }

    console.log("Attempting to unlock door...");

    // The key mesh should be attached to zowieCharacter (based on pickupKey)
    if (heldKey.parent === zowieCharacter) {
        zowieCharacter.remove(heldKey);
        console.log("Key removed from Zowie.");

        // Successfully removed, update state
        isCarryingKey = false;
        heldKey = null; // Important to clear the reference

        displayText('Door unlocked! Happy Birthday!'); // Update UI text
        
        // Trigger effects directly
        console.log("Triggering birthday effects");
        
        // Create confetti effect
        if (typeof createConfettiEffect === 'function') {
            createConfettiEffect();
        } else {
            console.error("createConfettiEffect function not found");
        }
        
        // Show ONLY the Ghibli-style birthday message with flowers
        if (typeof showGhibliBirthdayMessage === 'function') {
            showGhibliBirthdayMessage();
        } else {
            console.error("showGhibliBirthdayMessage function not found");
        }
        
        // DON'T update the persistent birthday message in the DOM
        // Remove these lines to avoid the persistent message
        /*
        const birthdayMessage = document.getElementById('birthday-message');
        if (birthdayMessage) {
            birthdayMessage.textContent = 'Belated Happy Birthday Zowie! You\'re the best!';
            birthdayMessage.style.opacity = '1';
        }
        */

    } else {
        console.error("Unlock failed: Held key is not attached to Zowie as expected.", heldKey.parent);
        // As a fallback, try removing from the scene directly, though this shouldn't be needed
        scene.remove(heldKey);
        isCarryingKey = false; // Still update state if possible
        heldKey = null;
        displayText('Error unlocking.'); // Indicate an issue
    }
}

// Function to check if Zowie is near the bucket
function isNearBucket() {
    // ... existing isNearBucket function ...
}

// Function to check if Zowie is near the pond
function isNearPond() {
    // ... existing isNearPond function ...
}

// Function to find a nearby punchable pumpkin
function findNearbyPumpkin() {
    // ... existing findNearbyPumpkin function ...
}