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

// Add these variables at the top of the file with other variables
var isCarryingBucket = false;
var heldBucket = null;
var bucket = null;

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
    const dirtPatch = createDirtPatch();
    scene.add(dirtPatch);

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
    
    // Update last key states
    lastCKeyState = cKeyPressed;
    lastDKeyState = dKeyPressed;
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
    
    console.log("Seed dropped successfully");
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
                displayText('Press D to drop bucket');
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


// function pickupBucket() {
//     if (isCarryingBucket || !bucket) return;
    
//     isCarryingBucket = true;
    
//     // Hide the original bucket
//     bucket.visible = false;
    
//     // Create a new mesh for the held bucket - making it smaller
//     const heldBucketGroup = new THREE.Group();
    
//     // Bucket body - smaller size for holding
//     const bucketGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 16); // Reduced size
//     const bucketMaterial = new THREE.MeshStandardMaterial({
//         color: 0xcc0000,
//         roughness: 0.7,
//         metalness: 0.3
//     });
//     const bucketMesh = new THREE.Mesh(bucketGeometry, bucketMaterial);
//     bucketMesh.position.y = 0.125; // Half height
//     heldBucketGroup.add(bucketMesh);
    
//     // Bucket rim - smaller size for holding
//     const rimGeometry = new THREE.TorusGeometry(0.15, 0.015, 8, 24); // Reduced size
//     const rimMaterial = new THREE.MeshStandardMaterial({
//         color: 0xdd0000,
//         roughness: 0.5,
//         metalness: 0.4
//     });
//     const rim = new THREE.Mesh(rimGeometry, rimMaterial);
//     rim.position.y = 0.25; // Position at top of bucket
//     rim.rotation.x = Math.PI / 2; // Lay flat
//     heldBucketGroup.add(rim);
    
//     // Bucket handle - smaller size for holding
//     const handleCurve = new THREE.CatmullRomCurve3([
//         new THREE.Vector3(-0.15, 0.25, 0),
//         new THREE.Vector3(-0.12, 0.35, 0),
//         new THREE.Vector3(0.12, 0.35, 0),
//         new THREE.Vector3(0.15, 0.25, 0)
//     ]);
//     const handleGeometry = new THREE.TubeGeometry(handleCurve, 12, 0.01, 8, false);
//     const handleMaterial = new THREE.MeshStandardMaterial({
//         color: 0xdd0000,
//         roughness: 0.5,
//         metalness: 0.4
//     });
//     const handle = new THREE.Mesh(handleGeometry, handleMaterial);
//     heldBucketGroup.add(handle);
    
//     // Find Zowie's right hand bone
//     let rightHand = null;
//     zowieCharacter.traverse(function(child) {
//         if (child.name && (
//             child.name.includes('RightHand') || 
//             child.name.includes('Hand_R') || 
//             child.name.includes('right_hand') ||
//             child.name.includes('mixamorig:RightHand') ||
//             child.name.includes('hand_r')
//         )) {
//             rightHand = child;
//             console.log("Found hand bone for bucket:", child.name);
//         }
//     });
    
//     // If we found the hand bone, attach to it
//     if (rightHand) {
//         // Create a more complex setup to maintain proper orientation
        
//         // First, create a main container for managing overall position
//         const bucketContainer = new THREE.Group();
//         rightHand.add(bucketContainer);
        
//         // Add an offset to position the bucket relative to the hand
//         // bucketContainer.position.set(0, -0.1, 0.1);
//         bucketContainer.position.set(0, 0.05, 0.1); // Move slightly up to align with palm

        
//         // Add the bucket group to the container
//         bucketContainer.add(heldBucketGroup);
        
//         // Move the bucket so the handle is positioned at the parent's origin
//         // This effectively positions the handle at the hand
//         heldBucketGroup.position.set(0, 0.1, 0);
        
//         // IMPORTANT: Rotate bucket so it's fully upright (vertical)
//         // And the handle is positioned for grabbing
//         // heldBucketGroup.rotation.set(0, 0, 0);
//         heldBucketGroup.rotation.set(-Math.PI / 2, 0, 0); // Rotate bucket so handle is aligned properly

        
//         // Slight adjustment to rotate handle toward fingers
//         bucketContainer.rotation.set(0, Math.PI/4, 0);
        
//         heldBucket = {
//             originalBucket: bucket,
//             heldMesh: heldBucketGroup,
//             container: bucketContainer,
//             attachedTo: rightHand
//         };
//     } else {
//         // Fallback: attach to character
//         console.log("Hand bone not found for bucket, using fallback positioning");
//         zowieCharacter.add(heldBucketGroup);
//         heldBucketGroup.position.set(0.2, 0.7, 0.3);
//         // heldBucketGroup.rotation.set(0, 0, 0);
//         heldBucketGroup.rotation.set(-Math.PI / 2, 0, 0); // Rotate bucket so handle is aligned properly
        
//         heldBucket = {
//             originalBucket: bucket,
//             heldMesh: heldBucketGroup,
//             attachedTo: zowieCharacter
//         };
//     }
    
//     console.log("Bucket picked up successfully");
// }

// function pickupBucket() {
//     if (isCarryingBucket || !bucket) return;
    
//     isCarryingBucket = true;
    
//     // Hide the original bucket
//     bucket.visible = false;
    
//     // Create a group to manage the held bucket
//     const heldBucketGroup = new THREE.Group();
    
//     // Bucket body - smaller size for holding
//     const bucketGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 16); // Reduced size
//     const bucketMaterial = new THREE.MeshStandardMaterial({
//         color: 0xcc0000,
//         roughness: 0.7,
//         metalness: 0.3
//     });
//     const bucketMesh = new THREE.Mesh(bucketGeometry, bucketMaterial);
//     bucketMesh.position.y = 0.125; // Half height
//     heldBucketGroup.add(bucketMesh);
    
//     // Bucket rim - smaller size for holding
//     const rimGeometry = new THREE.TorusGeometry(0.15, 0.015, 8, 24); // Reduced size
//     const rimMaterial = new THREE.MeshStandardMaterial({
//         color: 0xdd0000,
//         roughness: 0.5,
//         metalness: 0.4
//     });
//     const rim = new THREE.Mesh(rimGeometry, rimMaterial);
//     rim.position.y = 0.25; // Position at top of bucket
//     rim.rotation.x = Math.PI / 2; // Lay flat
//     heldBucketGroup.add(rim);
    
//     // Bucket handle - smaller size for holding
//     const handleCurve = new THREE.CatmullRomCurve3([
//         new THREE.Vector3(-0.15, 0.25, 0),
//         new THREE.Vector3(-0.12, 0.35, 0),
//         new THREE.Vector3(0.12, 0.35, 0),
//         new THREE.Vector3(0.15, 0.25, 0)
//     ]);
//     const handleGeometry = new THREE.TubeGeometry(handleCurve, 12, 0.01, 8, false);
//     const handleMaterial = new THREE.MeshStandardMaterial({
//         color: 0xaaaaaa,
//         roughness: 0.5,
//         metalness: 0.4
//     });
//     const handle = new THREE.Mesh(handleGeometry, handleMaterial);
//     handle.name = "bucketHandle"; // Identify handle for attaching
//     heldBucketGroup.add(handle);
    
//     // Find Zowie's right hand bone
//     let rightHand = null;
//     zowieCharacter.traverse(function(child) {
//         if (child.name && (
//             child.name.includes('RightHand') || 
//             child.name.includes('Hand_R') || 
//             child.name.includes('right_hand') ||
//             child.name.includes('mixamorig:RightHand') ||
//             child.name.includes('hand_r')
//         )) {
//             rightHand = child;
//             console.log("Found hand bone for bucket:", child.name);
//         }
//     });
    
//     if (rightHand) {
//         // Create a parent group for handling alignment
//         const bucketContainer = new THREE.Group();
//         rightHand.add(bucketContainer);
        
//         // Attach bucket to the correct position on the handle
//         handle.geometry.computeBoundingBox();
//         const handleCenter = handle.geometry.boundingBox.getCenter(new THREE.Vector3());
        
//         heldBucketGroup.position.set(-handleCenter.x, -handleCenter.y, -handleCenter.z);
//         bucketContainer.add(heldBucketGroup);
        
//         // Position and rotate the container properly
//         bucketContainer.position.set(0, 0, 0.1); // Adjusted to grip handle
//         bucketContainer.rotation.set(-Math.PI / 2, 0, Math.PI / 2); // Rotate for natural handle hold
//     } else {
//         // Fallback: attach to character if hand not found
//         console.log("Hand bone not found for bucket, using fallback positioning");
//         zowieCharacter.add(heldBucketGroup);
//         heldBucketGroup.position.set(0.2, 0.7, 0.3);
//         heldBucketGroup.rotation.set(-Math.PI / 2, 0, 0);
//     }
    
//     heldBucket = {
//         originalBucket: bucket,
//         heldMesh: heldBucketGroup,
//         attachedTo: rightHand || zowieCharacter
//     };
    
//     console.log("Bucket picked up successfully by the handle!");
// }
function pickupBucket() {
    if (isCarryingBucket || !bucket) return;
    
    isCarryingBucket = true;
    bucket.visible = false;
    
    const heldBucketGroup = new THREE.Group();
    
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
        
        // // Debug: Visualize hand bone axes
        // const axesHelper = new THREE.AxesHelper(0.5); // Red = x, Green = y, Blue = z
        // rightHand.add(axesHelper);
        
        // Center the bucket on the handle
        handle.geometry.computeBoundingBox();
        const handleCenter = handle.geometry.boundingBox.getCenter(new THREE.Vector3());
        heldBucketGroup.position.set(-handleCenter.x, -handleCenter.y, -handleCenter.z);
        bucketContainer.add(heldBucketGroup);
        
        // Position so the handle is in the hand, bucket hangs below
        bucketContainer.position.set(0, -0.2, 0); // Downward offset to hang below hand
        
        // Set rotation for upright bucket (flipped 180° from upside down)
        bucketContainer.rotation.set(Math.PI * 0.9, 0, 0); // Rotate 180° around x-axis
        
        heldBucket = {
            originalBucket: bucket,
            heldMesh: heldBucketGroup,
            attachedTo: rightHand,
            container: bucketContainer
        };
    } else {
        console.log("Hand bone not found for bucket, using fallback positioning");
        zowieCharacter.add(heldBucketGroup);
        heldBucketGroup.position.set(0.2, 0.7, 0.3);
        heldBucketGroup.rotation.set(Math.PI, 0, 0); // Upright in fallback
        heldBucket = {
            originalBucket: bucket,
            heldMesh: heldBucketGroup,
            attachedTo: zowieCharacter
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
    
    isCarryingBucket = false;
    heldBucket = null;
    
    console.log("Bucket dropped successfully");
}