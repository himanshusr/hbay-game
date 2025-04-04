// Global scene objects
let scene, camera, renderer, controls;
const clock = new THREE.Clock();

// Camera settings
const initialOffset = new THREE.Vector3(0, 3, 5);
const defaultOffset = new THREE.Vector3(0, 6, 12);
window.farViewOffset = new THREE.Vector3(0, 6, 10.5); // Make it globally accessible

// Setup function to initialize scene, camera, and renderer
function setupScene() {
    // Scene setup with a serene vibe
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffd1b3, 0.002);
    
    // Camera - initialized with a farther starting position
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(farViewOffset); // Use the farther position initially
    camera.lookAt(0, 1.5, 0);
    
    // Renderer with warm lighting
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.body.appendChild(renderer.domElement);
    
    // Camera info display
    // setupCameraInfo();
    
    // Controls setup
    setupControls();
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize);
    
    // Setup lighting
    setupLighting();
}

// Setup camera info display
function setupCameraInfo() {
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
    
    // Add to the global scope for use in the animate loop
    window.cameraInfo = cameraInfo;
}

// Setup orbit controls
function setupControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enabled = false; // Start disabled
    controls.target.set(0, 1.5, 0);

    // Only enable click/drag for camera on non-mobile devices
    if (!isMobileDevice()) { // Check if it's NOT mobile
        // Enable angle change on click-and-drag
        document.addEventListener('mousedown', () => {
            // Only enable if not currently doing a touch drag (safety check, though unlikely)
            if (!isDragging) {
                controls.enabled = true;
                document.body.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mouseup', () => {
            controls.enabled = false;
            document.body.style.cursor = 'default';
        });
    } else {
        // On mobile, keep OrbitControls disabled so it doesn't interfere
        // with the movement drag controls.
        controls.enabled = false;
    }

    // Store offsets for use in updateCamera
    controls.farViewOffset = farViewOffset;
}

// Helper function (ensure isMobileDevice is accessible here or redefine it)
// You might need to move isMobileDevice to utils.js or ensure controls.js is loaded before scene.js
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Setup scene lighting
function setupLighting() {
    // California evening golden hour lighting - softer and more ethereal
    const ambientLight = new THREE.AmbientLight(0xffcccb, 0.6);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xff9e7a, 1.0);
    sunLight.position.set(-60, 20, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
