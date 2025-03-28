// Scene setup with California evening campus vibe
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xf5b68f, 0.003); // Warm evening fog

// Camera - now positioned in front of characters
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15); // Static camera position
camera.lookAt(0, 1.5, 0);      // Looking at the center where characters start

// Renderer with warm lighting
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // Brighter for golden hour
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.update();

// Character control parameters
const walkSpeed = 0.1; // Responsive movement
const rotationSpeed = 0.1; 

// Fixed camera position
camera.position.set(0, 5, 15); // Static camera position
camera.lookAt(0, 1.5, 0);      // Looking at the center where characters start

// California evening golden hour lighting
const ambientLight = new THREE.AmbientLight(0xffcccb, 0.6); // Warm ambient
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xff9e7a, 1.0); // Golden hour sunlight
sunLight.position.set(-60, 20, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
scene.add(sunLight);

// Gradient evening sky
function createGradientSky() {
    const skyGeometry = new THREE.SphereGeometry(450, 32, 32);
    const uniforms = {
        topColor: { value: new THREE.Color(0x1e3c72) },    // Deep blue
        middleColor: { value: new THREE.Color(0xff9966) }, // Orange
        bottomColor: { value: new THREE.Color(0xff5e62) }, // Warm pink
        offset: { value: 15 },
        exponent: { value: 0.6 }
    };

    const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 topColor;
        uniform vec3 middleColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            float t = max(0.0, min(1.0, (h + 1.0) / 2.0));
            vec3 color = mix(bottomColor, middleColor, pow(t, exponent));
            color = mix(color, topColor, pow(max(0.0, t-0.5)*2.0, exponent));
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    return sky;
}

const sky = createGradientSky();
scene.add(sky);

// Add scattered stars like fallen grains
function createScatteredStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const starsVertices = [];
    // Create stars primarily in the upper part of the sky
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = Math.random() * 400 + 100; // Higher in the sky
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    return stars;
}

const stars = createScatteredStars();

// Campus ground (green quad)
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x66bb6a, // Vibrant grass color
    roughness: 0.8,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Campus pathways
function createCampusPaths() {
    const pathGroup = new THREE.Group();
    
    // Main path
    const mainPathGeometry = new THREE.PlaneGeometry(8, 50);
    const pathMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0, // Light concrete
        roughness: 0.7,
        metalness: 0.0
    });
    const mainPath = new THREE.Mesh(mainPathGeometry, pathMaterial);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.y = 0.01; // Slightly above ground
    mainPath.receiveShadow = true;
    pathGroup.add(mainPath);
    
    // Crossing paths
    const crossPathGeometry = new THREE.PlaneGeometry(30, 5);
    const crossPath = new THREE.Mesh(crossPathGeometry, pathMaterial);
    crossPath.rotation.x = -Math.PI / 2;
    crossPath.position.y = 0.01;
    crossPath.position.z = -10;
    crossPath.receiveShadow = true;
    pathGroup.add(crossPath);
    
    return pathGroup;
}

const campusPaths = createCampusPaths();
scene.add(campusPaths);

// Create California-style college buildings
function createCollegeBuildings() {
    const buildingsGroup = new THREE.Group();
    
    // Main academic building
    const mainBuildingGeometry = new THREE.BoxGeometry(20, 10, 12);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc88c64, // Warm terra cotta color (typical California architecture)
        roughness: 0.7,
        metalness: 0.1
    });
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, buildingMaterial);
    mainBuilding.position.set(0, 5, -30);
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    buildingsGroup.add(mainBuilding);
    
    // Spanish-style roof
    const roofGeometry = new THREE.ConeGeometry(14, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xb74938, // Terra cotta roof tiles
        roughness: 0.8
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 12, -30);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    buildingsGroup.add(roof);
    
    // Windows
    for (let i = 0; i < 5; i++) {
        const windowGeometry = new THREE.PlaneGeometry(2, 3);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffeb99, // Warm window light
            side: THREE.DoubleSide,
            emissive: 0xffeb99,
            emissiveIntensity: 0.5
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(-6 + i * 3, 5, -23.95);
        buildingsGroup.add(windowMesh);
    }
    
    // Secondary buildings
    const createSideBuilding = (x, z) => {
        const buildingGeometry = new THREE.BoxGeometry(10, 8, 8);
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, 4, z);
        building.castShadow = true;
        building.receiveShadow = true;
        buildingsGroup.add(building);
        
        // Roof
        const sideRoofGeometry = new THREE.ConeGeometry(7, 3, 4);
        const sideRoof = new THREE.Mesh(sideRoofGeometry, roofMaterial);
        sideRoof.position.set(x, 9.5, z);
        sideRoof.rotation.y = Math.PI / 4;
        sideRoof.castShadow = true;
        buildingsGroup.add(sideRoof);
        
        // Windows
        for (let i = 0; i < 2; i++) {
            const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
            const windowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffeb99,
                side: THREE.DoubleSide,
                emissive: 0xffeb99,
                emissiveIntensity: 0.5
            });
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(x - 2 + i * 4, 4, z + 4.01);
            buildingsGroup.add(windowMesh);
        }
    };
    
    createSideBuilding(-20, -25);
    createSideBuilding(20, -25);
    
    // Birthday message sign
    const signGeometry = new THREE.BoxGeometry(10, 2, 0.5);
    const signMaterial = new THREE.MeshStandardMaterial({
        color: 0x4fc3f7,
        roughness: 0.4,
        metalness: 0.6
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 6, -24);
    buildingsGroup.add(sign);
    
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#2196f3';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';
    context.fillText('Happy Birthday Zowie!', canvas.width/2, canvas.height/2 + 10);
    
    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true
    });
    
    const textGeometry = new THREE.PlaneGeometry(9.8, 1.8);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 6, -23.7);
    buildingsGroup.add(textMesh);
    
    return buildingsGroup;
}

const collegeBuildings = createCollegeBuildings();
scene.add(collegeBuildings);

// Add some California palm trees
function createPalmTree(x, z) {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 6, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8d6e63,
        roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Palm fronds
    const frondsMaterial = new THREE.MeshStandardMaterial({
        color: 0x66bb6a,
        roughness: 0.8,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 7; i++) {
        const frondGeometry = new THREE.PlaneGeometry(4, 1);
        const frond = new THREE.Mesh(frondGeometry, frondsMaterial);
        const angle = (i / 7) * Math.PI * 2;
        frond.position.set(
            Math.cos(angle) * 1.2,
            6,
            Math.sin(angle) * 1.2
        );
        frond.rotation.x = Math.PI / 4;
        frond.rotation.y = angle;
        frond.castShadow = true;
        group.add(frond);
    }
    
    group.position.set(x, 0, z);
    return group;
}

// Add palm trees along the paths
const palmTrees = new THREE.Group();
[-15, -8, 8, 15].forEach(x => {
    palmTrees.add(createPalmTree(x, -10));
});
[-25, 25].forEach(x => {
    palmTrees.add(createPalmTree(x, -5));
    palmTrees.add(createPalmTree(x, -15));
});
scene.add(palmTrees);

// Add some benches
function createBench(x, z, rotation) {
    const group = new THREE.Group();
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(3, 0.2, 1);
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.9
    });
    const seat = new THREE.Mesh(seatGeometry, woodMaterial);
    seat.position.y = 0.6;
    seat.castShadow = true;
    group.add(seat);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 1);
    for (let i = -1; i <= 1; i += 2) {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(i * 1.2, 0.3, 0);
        leg.castShadow = true;
        group.add(leg);
    }
    
    // Backrest
    const backGeometry = new THREE.BoxGeometry(3, 1, 0.2);
    const back = new THREE.Mesh(backGeometry, woodMaterial);
    back.position.set(0, 1.1, -0.4);
    back.castShadow = true;
    group.add(back);
    
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    return group;
}

const benches = new THREE.Group();
benches.add(createBench(-12, -5, 0));
benches.add(createBench(12, -5, 0));
benches.add(createBench(-5, -15, Math.PI / 2));
benches.add(createBench(5, -15, -Math.PI / 2));
scene.add(benches);

// FBX Loader and character setup
const loader = new THREE.FBXLoader();
let modelsLoaded = 0;

// Character variables
let yourCharacter, zowieCharacter;
let yourMixer, zowieMixer;
let yourWalkAnimation, zowieWalkAnimation;
let isWalking = false;
let reachedDestination = false;

// Utility function to log messages
function log(message) {
    console.log(message);
    // You can also update a UI element with this message
};

// Load your character (hsr_final.fbx)
log('Loading your character model...');
loader.load(
    'hsr_final.fbx',
    function(object) {
        yourCharacter = object;
        
        // Position and scale
        const fixedHeight = 1.5;
        yourCharacter.position.set(-1, fixedHeight, 0);
        const scale = getAppropriateScale(object);
        yourCharacter.scale.set(scale, scale, scale);
        scene.add(yourCharacter);
        
        log(`HSR character loaded and positioned at y=${fixedHeight}`);

        // Set up animation mixer
        yourMixer = new THREE.AnimationMixer(yourCharacter);
        
        // Load walk animation separately
        loader.load(
            'hsr_inplace.fbx', // Make sure this matches your actual filename (case sensitive)
            function(animObject) {
                log('HSR walk animation loaded');
                
                // Check if animations exist in the loaded file
                if (animObject.animations && animObject.animations.length > 0) {
                    log(`Found ${animObject.animations.length} animations in HSR walking file`);
                    
                    // Create animation action and configure it
                    yourWalkAnimation = yourMixer.clipAction(animObject.animations[0]);
                    yourWalkAnimation.setEffectiveTimeScale(1);
                    yourWalkAnimation.setEffectiveWeight(1);
                    yourWalkAnimation.loop = THREE.LoopRepeat;
                    
                    // IMPORTANT: Set a specific frame as the idle pose
                    // Find a good frame in the walking animation where the character is standing naturally
                    const idleFrame = 10; // Try different frame numbers
                    
                    // Extract pose from this frame and apply it
                    yourWalkAnimation.play();
                    yourWalkAnimation.paused = true;
                    yourWalkAnimation.time = idleFrame / 30; // Assuming 30fps animation
                    yourMixer.update(0); // Apply the pose
                    
                    // Manually pose the character if the animation doesn't work
                    // This is a fallback if the animation approach doesn't work
                    if (yourCharacter.skeleton && yourCharacter.skeleton.bones) {
                        log('Applying manual pose adjustments to HSR');
                        
                        // Find and adjust arm bones to avoid T-pose
                        yourCharacter.skeleton.bones.forEach(bone => {
                            // Target specific bones that form the T-pose
                            if (bone.name.includes('Arm') || bone.name.includes('arm') || 
                                bone.name.includes('shoulder') || bone.name.includes('Shoulder')) {
                                
                                // Adjust left arm down
                                if (bone.name.includes('Left') || bone.name.includes('left') || 
                                    bone.name.includes('L_')) {
                                    bone.rotation.z -= 0.5; // Rotate down
                                }
                                // Adjust right arm down
                                else if (bone.name.includes('Right') || bone.name.includes('right') || 
                                         bone.name.includes('R_')) {
                                    bone.rotation.z += 0.5; // Rotate down
                                }
                            }
                        });
                        
                        // Force update
                        if (yourCharacter.skeleton) {
                            yourCharacter.skeleton.update();
                        }
                    }
                    
                    log('HSR walk animation prepared and manual pose set');
                } else {
                    log('ERROR: No animations found in HSR walking file');
                }
                
                modelsLoaded++;
                checkAllLoaded();
            },
            undefined,
            function(error) {
                log('ERROR loading HSR walk animation: ' + error);
                modelsLoaded++;
                checkAllLoaded();
            }
        );
    }
);

// Load Zowie's character
log('Loading Zowie\'s character model...');
loader.load(
    'zowie_final.fbx',
    function(object) {
        zowieCharacter = object;
        
        // Position and scale
        const fixedHeight = 1.5;
        zowieCharacter.position.set(1, fixedHeight, 0);
        const scale = getAppropriateScale(object);
        zowieCharacter.scale.set(scale, scale, scale);
        scene.add(zowieCharacter);
        
        log(`Zowie character loaded and positioned at y=${fixedHeight}`);

        // Set up animation mixer
        zowieMixer = new THREE.AnimationMixer(zowieCharacter);
        
        // Load walk animation separately
        loader.load(
            'zowie_inplace.fbx', // Make sure this matches your actual filename (case sensitive)
            function(animObject) {
                log('Zowie walk animation loaded');
                
                // Check if animations exist in the loaded file
                if (animObject.animations && animObject.animations.length > 0) {
                    log(`Found ${animObject.animations.length} animations in Zowie walking file`);
                    
                    // Create animation action and configure it
                    zowieWalkAnimation = zowieMixer.clipAction(animObject.animations[0]);
                    zowieWalkAnimation.setEffectiveTimeScale(1);
                    zowieWalkAnimation.setEffectiveWeight(1);
                    zowieWalkAnimation.loop = THREE.LoopRepeat;
                    
                    // IMPORTANT: Set a specific frame as the idle pose
                    // Find a good frame in the walking animation where the character is standing naturally
                    const idleFrame = 10; // Try different frame numbers
                    
                    // Extract pose from this frame and apply it
                    zowieWalkAnimation.play();
                    zowieWalkAnimation.paused = true;
                    zowieWalkAnimation.time = idleFrame / 30; // Assuming 30fps animation
                    zowieMixer.update(0); // Apply the pose
                    
                    // Manually pose the character if the animation doesn't work
                    // This is a fallback if the animation approach doesn't work
                    if (zowieCharacter.skeleton && zowieCharacter.skeleton.bones) {
                        log('Applying manual pose adjustments to Zowie');
                        
                        // Find and adjust arm bones to avoid T-pose
                        zowieCharacter.skeleton.bones.forEach(bone => {
                            // Target specific bones that form the T-pose
                            if (bone.name.includes('Arm') || bone.name.includes('arm') || 
                                bone.name.includes('shoulder') || bone.name.includes('Shoulder')) {
                                
                                // Adjust left arm down
                                if (bone.name.includes('Left') || bone.name.includes('left') || 
                                    bone.name.includes('L_')) {
                                    bone.rotation.z -= 0.5; // Rotate down
                                }
                                // Adjust right arm down
                                else if (bone.name.includes('Right') || bone.name.includes('right') || 
                                         bone.name.includes('R_')) {
                                    bone.rotation.z += 0.5; // Rotate down
                                }
                            }
                        });
                        
                        // Force update
                        if (zowieCharacter.skeleton) {
                            zowieCharacter.skeleton.update();
                        }
                    }
                    
                    log('Zowie walk animation prepared and manual pose set');
                } else {
                    log('ERROR: No animations found in Zowie walking file');
                }
                
                modelsLoaded++;
                checkAllLoaded();
            },
            undefined,
            function(error) {
                log('ERROR loading Zowie walk animation: ' + error);
                modelsLoaded++;
                checkAllLoaded();
            }
        );
    }
);

function getBoundingBoxSize(object) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    return `width: ${size.x.toFixed(2)}, height: ${size.y.toFixed(2)}, depth: ${size.z.toFixed(2)}`;
}

function getAppropriateScale(object) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    // Calculate appropriate scale based on height
    const targetHeight = 2; // Desired height in units
    let scale = targetHeight / size.y;
    
    // Limit scale to reasonable values
    scale = Math.max(0.01, Math.min(scale, 10));
    
    return scale;
}

function checkAllLoaded() {
    if (modelsLoaded >= 2) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('instructions').style.opacity = 1;
    }
}

// Handle keyboard controls
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    
    if (event.key === ' ') {
        cameraFollowing = !cameraFollowing;
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Add camera position debug info
const cameraInfo = document.createElement('div');
cameraInfo.style.position = 'absolute';
cameraInfo.style.bottom = '10px';
cameraInfo.style.right = '10px';
cameraInfo.style.color = 'white';
cameraInfo.style.background = 'rgba(0,0,0,0.5)';
cameraInfo.style.padding = '10px';
cameraInfo.style.fontFamily = 'monospace';
cameraInfo.style.zIndex = '100';
document.body.appendChild(cameraInfo);

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Subtle star twinkling
    if (stars && stars.material) {
        stars.material.opacity = 0.7 + Math.sin(elapsedTime * 0.5) * 0.3;
    }
    
    // Update mixers
    if (yourMixer) yourMixer.update(delta);
    if (zowieMixer) zowieMixer.update(delta);
    
    // Manual control with arrow keys
    if (yourCharacter && zowieCharacter) {
        let moved = false;
        let directionX = 0;
        let directionZ = 0;
        
        // Calculate movement direction
        if (keys['ArrowUp']) directionZ = -1;
        if (keys['ArrowDown']) directionZ = 1;
        if (keys['ArrowLeft']) directionX = -1;
        if (keys['ArrowRight']) directionX = 1;
        
        // Check if character is moving
        moved = (directionX !== 0 || directionZ !== 0);
        
        if (moved) {
            // Calculate angle based on direction
            if (directionX !== 0 || directionZ !== 0) {
                const angle = Math.atan2(directionX, directionZ);
                
                // Rotate characters to face the direction they're moving
                yourCharacter.rotation.y = angle;
                zowieCharacter.rotation.y = angle;
                
                // Move in that direction
                yourCharacter.position.x += directionX * walkSpeed;
                yourCharacter.position.z += directionZ * walkSpeed;
                zowieCharacter.position.x += directionX * walkSpeed;
                zowieCharacter.position.z += directionZ * walkSpeed;
            }
        }
        
        // Play/pause walk animations based on movement
        if (moved && !isWalking) {
            log('Starting walk animations');
            if (yourWalkAnimation) {
                yourWalkAnimation.reset();
                yourWalkAnimation.play();
                log('HSR walk animation playing');
            } else {
                log('HSR walk animation not available');
            }
            
            if (zowieWalkAnimation) {
                zowieWalkAnimation.reset();
                zowieWalkAnimation.play();
                log('Zowie walk animation playing');
            } else {
                log('Zowie walk animation not available');
            }
            
            isWalking = true;
        } else if (!moved && isWalking) {
            log('Stopping walk animations');
            if (yourWalkAnimation) yourWalkAnimation.stop();
            if (zowieWalkAnimation) zowieWalkAnimation.stop();
            isWalking = false;
        }
        
        // Check if reached the main building
        if (yourCharacter.position.z <= -20) {
            // Show birthday message when reaching the building
            document.getElementById('birthday-message').style.opacity = 1;
        }
    }
    
    // Update camera info
    cameraInfo.textContent = `Camera: x:${camera.position.x.toFixed(2)} y:${camera.position.y.toFixed(2)} z:${camera.position.z.toFixed(2)}`;
    
    // Update controls and render
    controls.update();
    renderer.render(scene, camera);
}

// Disable orbit controls to keep camera fixed
controls.enabled = false;

// Reset camera-related variables without redeclaring
cameraFollowing = false; // Use existing variable
const firstMovementMade = false; // New variable
const cameraTransitioning = false; // New variable

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop
animate(); 