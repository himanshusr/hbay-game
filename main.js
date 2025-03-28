// main.js

// Scene setup with a serene vibe
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xffd1b3, 0.002); // Softer, warmer fog for purity

// Camera - initialized with a zoomed-in starting position
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 5); // Zoomed-in initially

// Renderer with warm lighting
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // Brighter for golden hour
document.body.appendChild(renderer.domElement);

// Controls - enabled only on click-and-drag
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Limit vertical rotation
controls.enableZoom = false; // Disable zoom
controls.enablePan = false; // Disable panning
controls.enabled = false; // Disabled by default
controls.target.set(0, 1.5, 0); // Initial target (will update to character)

// Cursor control on click-and-drag
document.addEventListener('mousedown', () => {
    controls.enabled = true;
    document.body.style.cursor = 'grabbing'; // Change cursor to indicate rotation mode
});
document.addEventListener('mouseup', () => {
    controls.enabled = false;
    document.body.style.cursor = 'default'; // Revert cursor to default
});

// Character control parameters
const walkSpeed = 0.1;
const rotationSpeed = 0.1;

// California evening golden hour lighting - softer and more ethereal
const ambientLight = new THREE.AmbientLight(0xffcccb, 0.6); // Warmer, gentler ambient
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xff9e7a, 1.0); // Slightly softer golden hour light
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

// Scattered stars
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
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = Math.random() * 400 + 100;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    return stars;
}

const stars = createScatteredStars();

// Campus ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x66bb6a,
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

const campusPaths = createCampusPaths();
scene.add(campusPaths);

// Detailed college buildings
function createCollegeBuildings() {
    const buildingsGroup = new THREE.Group();
    
    const mainBuildingGeometry = new THREE.BoxGeometry(24, 12, 14);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd9a686, // Warm terra cotta
        roughness: 0.6,
        metalness: 0.1
    });
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, buildingMaterial);
    mainBuilding.position.set(0, 6, -30);
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    buildingsGroup.add(mainBuilding);
    
    const roofGeometry = new THREE.ConeGeometry(16, 5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc94a3b, // Rich terra cotta roof
        roughness: 0.7
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 14.5, -30);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    buildingsGroup.add(roof);
    
    const archMaterial = new THREE.MeshStandardMaterial({ color: 0xd9a686 });
    for (let i = -2; i <= 2; i++) {
        const archGeometry = new THREE.TorusGeometry(2, 0.2, 16, 32, Math.PI);
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.position.set(i * 4, 3, -23);
        arch.rotation.x = Math.PI / 2;
        arch.castShadow = true;
        buildingsGroup.add(arch);
    }
    
    for (let i = 0; i < 6; i++) {
        const windowGeometry = new THREE.PlaneGeometry(2, 3.5);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xfff5b6, // Warm window glow
            side: THREE.DoubleSide,
            emissive: 0xfff5b6,
            emissiveIntensity: 0.6
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(-8 + i * 3, 6, -23.95);
        buildingsGroup.add(windowMesh);
    }
    
    const createSideBuilding = (x, z) => {
        const buildingGeometry = new THREE.BoxGeometry(12, 9, 10);
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, 4.5, z);
        building.castShadow = true;
        building.receiveShadow = true;
        buildingsGroup.add(building);
        
        const roofGeometry = new THREE.ConeGeometry(8, 3.5, 4);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(x, 10.5, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        buildingsGroup.add(roof);
        
        const columnGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 12);
        for (let i = -1; i <= 1; i += 2) {
            const column = new THREE.Mesh(columnGeometry, buildingMaterial);
            column.position.set(x + i * 4, 3, z + 4.5);
            column.castShadow = true;
            buildingsGroup.add(column);
        }
    };
    
    createSideBuilding(-22, -25);
    createSideBuilding(22, -25);
    
    // Updated sign with Ghibli-style "Happy Birthday"
    const signGeometry = new THREE.BoxGeometry(12, 2.5, 0.5);
    const signMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcccb, // Soft pink for a cute Ghibli vibe
        roughness: 0.3,
        metalness: 0.2
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 7, -24);
    buildingsGroup.add(sign);

    // Load Ghibli-style font (Mochiy Pop P One)
    const fontLoader = new FontFace('Mochiy Pop', 'url(https://fonts.googleapis.com/css2?family=Mochiy+Pop+P+One&display=swap)');
    document.fonts.add(fontLoader);
    fontLoader.load().then(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        // Soft pastel background
        context.fillStyle = '#ffe6e6'; // Light pinkish background
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Cute Ghibli-style text
        context.font = '48px "Mochiy Pop P One"'; // Ghibli-inspired font
        context.textAlign = 'center';
        context.fillStyle = '#ff6699'; // Bright, playful pink text
        context.fillText('Happy Birthday', canvas.width / 2, canvas.height / 2 + 15);
        
        // Subtle shadow for depth
        context.shadowColor = 'rgba(0, 0, 0, 0.2)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true
        });
        
        const textGeometry = new THREE.PlaneGeometry(11.8, 2.3);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 7, -23.7);
        buildingsGroup.add(textMesh);
    }).catch((error) => {
        console.error('Font loading failed:', error);
        // Fallback to Arial
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffe6e6';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.fillStyle = '#ff6699';
        context.fillText('Happy Birthday', canvas.width / 2, canvas.height / 2 + 15);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true
        });
        
        const textGeometry = new THREE.PlaneGeometry(11.8, 2.3);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 7, -23.7);
        buildingsGroup.add(textMesh);
    });
    
    return buildingsGroup;
}

const collegeBuildings = createCollegeBuildings();
scene.add(collegeBuildings);

// Detailed palm trees
function createPalmTree(x, z) {
    const group = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.35, 7, 12, 4, true);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8d6e63,
        roughness: 0.8
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3.5;
    trunk.rotation.z = Math.random() * 0.1 - 0.05;
    trunk.castShadow = true;
    group.add(trunk);
    
    const frondsMaterial = new THREE.MeshStandardMaterial({
        color: 0x66bb6a,
        roughness: 0.7,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 9; i++) {
        const frondGeometry = new THREE.PlaneGeometry(4.5, 1, 8, 1);
        const frond = new THREE.Mesh(frondGeometry, frondsMaterial);
        const angle = (i / 9) * Math.PI * 2;
        frond.position.set(
            Math.cos(angle) * 1.5,
            7 + Math.sin(angle) * 0.3,
            Math.sin(angle) * 1.5
        );
        frond.rotation.x = Math.PI / 3 + Math.random() * 0.2;
        frond.rotation.y = angle;
        frond.castShadow = true;
        
        const vertices = frond.geometry.attributes.position.array;
        for (let j = 0; j < vertices.length; j += 3) {
            const x = vertices[j];
            vertices[j + 1] -= (x * x) * 0.1;
        }
        frond.geometry.attributes.position.needsUpdate = true;
        
        group.add(frond);
    }
    
    group.position.set(x, 0, z);
    return group;
}

const palmTrees = new THREE.Group();
[-15, -8, 8, 15].forEach(x => {
    palmTrees.add(createPalmTree(x, -10));
});
[-25, 25].forEach(x => {
    palmTrees.add(createPalmTree(x, -5));
    palmTrees.add(createPalmTree(x, -15));
});
scene.add(palmTrees);

// Benches
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

const benches = new THREE.Group();
benches.add(createBench(-12, -5, 0));
benches.add(createBench(12, -5, 0));
benches.add(createBench(-5, -15, Math.PI / 2));
benches.add(createBench(5, -15, -Math.PI / 2));
scene.add(benches);

// Balloons
let balloons = null;
function createBalloons() {
    const balloonGroup = new THREE.Group();
    const colors = [0xff5555, 0x55ff55, 0x5555ff, 0xffff55];
    
    for (let i = 0; i < 100; i++) {
        const balloonGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const balloonMaterial = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 0.4,
            metalness: 0.2
        });
        const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
        balloon.position.set(
            (Math.random() - 0.5) * 10,
            2 + Math.random() * 2,
            -24 + (Math.random() - 0.5) * 5
        );
        balloon.castShadow = true;
        balloonGroup.add(balloon);
    }
    
    return balloonGroup;
}

balloons = createBalloons();
scene.add(balloons);

// FBX Loader and character setup
const loader = new THREE.FBXLoader();
let modelsLoaded = 0;
let yourCharacter, zowieCharacter;
let yourMixer, zowieMixer;
let yourWalkAnimation, zowieWalkAnimation;
let isWalking = false;

function log(message) {
    console.log(message);
}

loader.load(
    'hsr_final.fbx',
    function(object) {
        yourCharacter = object;
        const fixedHeight = 1.5;
        yourCharacter.position.set(-1, fixedHeight, 0);
        const scale = getAppropriateScale(object);
        yourCharacter.scale.set(scale, scale, scale);
        scene.add(yourCharacter);
        
        log(`HSR character loaded and positioned at y=${fixedHeight}`);
        
        yourMixer = new THREE.AnimationMixer(yourCharacter);
        
        loader.load(
            'hsr_inplace.fbx',
            function(animObject) {
                log('HSR walk animation loaded');
                if (animObject.animations && animObject.animations.length > 0) {
                    yourWalkAnimation = yourMixer.clipAction(animObject.animations[0]);
                    yourWalkAnimation.setEffectiveTimeScale(1);
                    yourWalkAnimation.setEffectiveWeight(1);
                    yourWalkAnimation.loop = THREE.LoopRepeat;
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

loader.load(
    'zowie_idle.fbx',
    function(object) {
        zowieCharacter = object;
        const fixedHeight = 1.5;
        zowieCharacter.position.set(1, fixedHeight, 0);
        const scale = getAppropriateScale(object);
        zowieCharacter.scale.set(scale, scale, scale);
        scene.add(zowieCharacter);
        
        log(`Zowie character loaded and positioned at y=${fixedHeight}`);
        
        zowieMixer = new THREE.AnimationMixer(zowieCharacter);
        
        loader.load(
            'zowie_inplace.fbx',
            function(animObject) {
                log('Zowie walk animation loaded');
                if (animObject.animations && animObject.animations.length > 0) {
                    zowieWalkAnimation = zowieMixer.clipAction(animObject.animations[0]);
                    zowieWalkAnimation.setEffectiveTimeScale(1);
                    zowieWalkAnimation.setEffectiveWeight(1);
                    zowieWalkAnimation.loop = THREE.LoopRepeat;
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

function getAppropriateScale(object) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const targetHeight = 2;
    let scale = targetHeight / size.y;
    scale = Math.max(0.01, Math.min(scale, 10));
    return scale;
}

function checkAllLoaded() {
    if (modelsLoaded >= 2) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        const instructionsElement = document.getElementById('instructions');
        if (instructionsElement) {
            instructionsElement.style.opacity = '1';
        }
    }
}

// Keyboard controls
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Camera info
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
let balloonsReleased = false;
let hasStartedWalking = false; // Flag to track if walking has started
const initialOffset = new THREE.Vector3(0, 3, 5); // Zoomed-in offset
const defaultOffset = new THREE.Vector3(0, 5, 10); // Default offset when walking

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    if (stars && stars.material) {
        stars.material.opacity = 0.7 + Math.sin(elapsedTime * 0.5) * 0.3;
    }
    
    palmTrees.children.forEach(tree => {
        tree.rotation.z = Math.sin(elapsedTime * 0.3) * 0.05;
    });
    
    if (yourMixer) yourMixer.update(delta);
    if (zowieMixer) zowieMixer.update(delta);
    
    if (yourCharacter && zowieCharacter) {
        let moved = false;
        let directionX = 0;
        let directionZ = 0;
        
        if (keys['ArrowUp']) directionZ = -1;
        if (keys['ArrowDown']) directionZ = 1;
        if (keys['ArrowLeft']) directionX = -1;
        if (keys['ArrowRight']) directionX = 1;
        
        moved = (directionX !== 0 || directionZ !== 0);
        
        if (moved) {
            const angle = Math.atan2(directionX, directionZ);
            yourCharacter.rotation.y = angle;
            zowieCharacter.rotation.y = angle;
            yourCharacter.position.x += directionX * walkSpeed;
            yourCharacter.position.z += directionZ * walkSpeed;
            zowieCharacter.position.x += directionX * walkSpeed;
            zowieCharacter.position.z += directionZ * walkSpeed;
            hasStartedWalking = true; // Mark that walking has started
        }
        
        if (moved && !isWalking) {
            if (yourWalkAnimation) yourWalkAnimation.play();
            if (zowieWalkAnimation) zowieWalkAnimation.play();
            isWalking = true;
        } else if (!moved && isWalking) {
            if (yourWalkAnimation) yourWalkAnimation.stop();
            if (zowieWalkAnimation) zowieWalkAnimation.stop();
            isWalking = false;
        }
        
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
        
        if (yourCharacter.position.z <= -20 && !balloonsReleased) {
            balloonsReleased = true;
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
            const birthdayMessage = document.getElementById('birthday-message');
            if (birthdayMessage) {
                birthdayMessage.textContent = 'Belated Happy Birthday Zowie!';
                birthdayMessage.style.opacity = '1';
            }
        }
    }
    
    cameraInfo.textContent = `Camera: x:${camera.position.x.toFixed(2)} y:${camera.position.y.toFixed(2)} z:${camera.position.z.toFixed(2)}`;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Ghibli-style image placeholders for Himanshu and Zowie
function createGhibliPlaceholder(name, topPosition) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    // Soft pastel background with subtle transparency
    context.fillStyle = 'rgba(255, 245, 230, 0.8)'; // Warm off-white, slightly transparent
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Simple Ghibli-style balloon shape
    context.beginPath();
    context.arc(64, 64, 40, 0, Math.PI * 2); // Circle for balloon
    context.fillStyle = name === 'Himanshu' ? '#ffb07a' : '#ffcccb'; // Peach for Himanshu, Pink for Zowie
    context.fill();
    context.closePath();

    // Minimalistic string
    context.beginPath();
    context.moveTo(64, 104);
    context.lineTo(64, 120);
    context.strokeStyle = '#8d6e63'; // Brown string
    context.lineWidth = 2;
    context.stroke();

    // Cute text matching HTML font
    context.font = '20px "Comic Sans MS", cursive, sans-serif'; // Match your HTML font
    context.fillStyle = '#ff69b4'; // Hot pink to match birthday message glow
    context.textAlign = 'center';
    context.fillText(name, 64, 50);

    // Subtle shadow for depth
    context.shadowColor = 'rgba(0, 0, 0, 0.2)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    const img = document.createElement('img');
    if (name === 'Himanshu') {
        img.src = 'himanshu_profile.png'; // Replace with your actual Himanshu image path
    } else if (name === 'Zowie') {
        img.src = 'zowie_profile.png'; // Replace with your actual Zowie image path
    }
    img.style.position = 'absolute';
    img.style.left = '20px'; // Align with #instructions
    img.style.top = `${topPosition}px`;
    img.style.width = '100px';
    img.style.height = '100px';
    img.style.zIndex = '10'; // Match other overlays
    img.style.borderRadius = '10px'; // Soft rounded edges
    img.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)'; // Subtle shadow
    document.body.appendChild(img);
}

// Add placeholders to the left side
createGhibliPlaceholder('Himanshu', 20); // Top left, below top edge
createGhibliPlaceholder('Zowie', 130);   // Bottom left, below Himanshu with gap

// Start animation
animate();