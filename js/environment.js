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
}

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

    return new THREE.Mesh(skyGeometry, skyMaterial);
}

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

// College buildings with complete implementation
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
    
    // Add large keyhole to the building (made smaller)
    const keyholeGroup = new THREE.Group();
    
    // Circular top part of keyhole (reduced size from 2 to 1.5)
    const circleGeometry = new THREE.CircleGeometry(1.5, 32);
    const keyholeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.5,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    const circleTop = new THREE.Mesh(circleGeometry, keyholeMaterial);
    circleTop.position.set(0, 7, -22.95);
    keyholeGroup.add(circleTop);
    
    // Rectangular bottom part of keyhole (reduced width from 1.2 to 0.9)
    const rectGeometry = new THREE.PlaneGeometry(0.9, 2.5);
    const rectBottom = new THREE.Mesh(rectGeometry, keyholeMaterial);
    rectBottom.position.set(0, 4.8, -22.95);
    keyholeGroup.add(rectBottom);
    
    // Add a slight glow around the keyhole (adjusted size to match)
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3399ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const glowCircle = new THREE.Mesh(
        new THREE.CircleGeometry(1.7, 32),
        glowMaterial
    );
    glowCircle.position.set(0, 7, -22.90);
    keyholeGroup.add(glowCircle);
    
    const glowRect = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 2.7),
        glowMaterial
    );
    glowRect.position.set(0, 4.8, -22.90);
    keyholeGroup.add(glowRect);
    
    buildingsGroup.add(keyholeGroup);
    
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
    
    // Add Ghibli-style white table to the right side building
    const tableGroup = new THREE.Group();
    
    // Table top - slightly rounded edges for Ghibli style
    const tableTopGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 16);
    const tableWhiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xfffaf0, // Warm white
        roughness: 0.3,
        metalness: 0.1
    });
    const tableTop = new THREE.Mesh(tableTopGeometry, tableWhiteMaterial);
    tableTop.position.set(0, 0.7, 0);
    tableGroup.add(tableTop);
    
    // Table legs with Ghibli-style curved design
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const xPos = Math.cos(angle) * 1.8;
        const zPos = Math.sin(angle) * 1.8;
        
        // Create curved leg
        const legPoints = [];
        for (let j = 0; j <= 5; j++) {
            const y = j * 0.14;
            // Add slight curve for whimsical Ghibli look
            const xCurve = 0.1 * Math.sin(j / 5 * Math.PI);
            legPoints.push(new THREE.Vector3(xCurve, y, 0));
        }
        
        const legCurve = new THREE.CatmullRomCurve3(legPoints);
        const legGeometry = new THREE.TubeGeometry(legCurve, 8, 0.12, 8, false);
        const leg = new THREE.Mesh(legGeometry, tableWhiteMaterial);
        
        leg.position.set(xPos, 0, zPos);
        leg.rotation.y = -angle;
        tableGroup.add(leg);
    }
    
    // Small decorative cloth with Ghibli pattern
    const clothGeometry = new THREE.CircleGeometry(1.8, 16);
    const clothMaterial = new THREE.MeshStandardMaterial({
        color: 0xE6CCB2, // Soft beige
        roughness: 0.7,
        side: THREE.DoubleSide
    });
    const cloth = new THREE.Mesh(clothGeometry, clothMaterial);
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.set(0, 0.71, 0);
    tableGroup.add(cloth);
    
    // Add small teapot (Ghibli-style)
    const teapotGroup = new THREE.Group();
    
    // Teapot body
    const teapotBodyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const teapotMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF, // White
        roughness: 0.2,
        metalness: 0.1
    });
    const teapotBody = new THREE.Mesh(teapotBodyGeometry, teapotMaterial);
    teapotBody.scale.set(1, 0.8, 1);
    teapotBody.position.y = 0.32;
    teapotGroup.add(teapotBody);
    
    // Teapot spout
    const spoutCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.1, 0, 0.2),
        new THREE.Vector3(0.3, 0, 0.4),
        new THREE.Vector3(0.5, 0, 0.5)
    ]);
    const spoutGeometry = new THREE.TubeGeometry(spoutCurve, 8, 0.08, 8, false);
    const spout = new THREE.Mesh(spoutGeometry, teapotMaterial);
    spout.position.set(0, 0.32, 0);
    teapotGroup.add(spout);
    
    // Teapot handle
    const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.2, 0.1, 0),
        new THREE.Vector3(-0.3, 0.2, 0),
        new THREE.Vector3(-0.2, 0.3, 0),
        new THREE.Vector3(0, 0.4, 0)
    ]);
    const handleGeometry = new THREE.TubeGeometry(handleCurve, 8, 0.06, 8, false);
    const handle = new THREE.Mesh(handleGeometry, teapotMaterial);
    handle.position.set(0, 0.2, 0);
    teapotGroup.add(handle);
    
    // Add the teapot to the table
    teapotGroup.position.set(0.5, 0.71, 0);
    tableGroup.add(teapotGroup);
    
    // Add fine grains (updated to Ghibli-style green, oval, and flat seeds)
    const seedGeometry = new THREE.SphereGeometry(0.15, 16, 16); // More detailed geometry
    const seedMaterial = new THREE.MeshStandardMaterial({
        color: 0x728C00, // Green color
        roughness: 0.5,
        metalness: 0.2
    });
    
    for (let i = 0; i < 6; i++) {
        const seed = new THREE.Mesh(seedGeometry, seedMaterial);
        seed.scale.set(1.5, 0.3, 1); // Oval and flat shape
        // Increase randomization range for wider scattering
        const xOffset = (Math.random() - 0.5) * 0.6; // Wider range
        const zOffset = (Math.random() - 0.5) * 0.6; // Wider range
        seed.position.set(-0.7 + xOffset, 0.96, zOffset);
        
        // Add subtle rotation for a more natural look
        seed.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Add a slight variation in color for each seed
        seed.material.color.setHSL(
            0.3, // Hue for green
            0.5 + Math.random() * 0.1, // Saturation
            0.4 + Math.random() * 0.1 // Lightness
        );
        
        tableGroup.add(seed);
    }
    
    // Position the entire table on top of the right side building
    tableGroup.position.set(22, 0, -15);
    buildingsGroup.add(tableGroup);
    
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


// Palm trees
function createPalmTrees() {
    const palmTrees = new THREE.Group();
    [-15, -8, 8, 15].forEach(x => {
        palmTrees.add(createPalmTree(x, -10));
    });
    [-25, 25].forEach(x => {
        palmTrees.add(createPalmTree(x, -5));
        palmTrees.add(createPalmTree(x, -15));
    });
    return palmTrees;
}

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

// Function to create the "C" icon
function createCIcon() {
    // Create a circle with 'C' texture
    const iconGeometry = new THREE.CircleGeometry(0.3, 32);
    
    // Create canvas for drawing the C
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Draw circle background
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(64, 64, 60, 0, Math.PI * 2);
    context.fill();
    
    // Draw C letter
    context.fillStyle = '#000000';
    context.font = 'bold 80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('C', 64, 64);
    
    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    // Create material with transparency
    const iconMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const icon = new THREE.Mesh(iconGeometry, iconMaterial);
    
    return icon;
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

// Function to handle seed pickup and drop
function handleSeedInteraction() {
    const cPressed = keys['c'] || false;
    const dPressed = keys['d'] || false;
    
    // Handle pickup (C key)
    if (cPressed && !lastCKeyState) {
        console.log("C key newly pressed");
        
        // Check cooldown to prevent rapid toggling
        if (pickupCooldown <= 0 && !isCarryingSeed) {
            console.log("Attempting to pick up seed");
            tryPickupSeed();
            
            // // Set cooldown to prevent multiple actions
            // pickupCooldown = 0.5; // seconds
        }
    }
    
    // Handle drop (D key)
    if (dPressed && !lastDKeyState) {
        console.log("D key newly pressed");
        
        // Check cooldown and if carrying a seed
        if (pickupCooldown <= 0 && isCarryingSeed) {
            console.log("Attempting to drop seed");
            dropSeed();
            
            // // Set cooldown to prevent multiple actions
            // pickupCooldown = 0.5; // seconds
        }
    }
    
    // Update cooldown
    if (pickupCooldown > 0) {
        pickupCooldown -= clock.getDelta();
    }
    
    // Store current key states for next frame
    lastCKeyState = cPressed;
    lastDKeyState = dPressed;
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
    
    // Update icons visibility
    if (cIcon && dIcon) {
        // C icon only shown when near seeds and not carrying
        if (!isCarryingSeed && nearAnySeed && seedsArray.length > 0) {
            cIcon.visible = true;
            dIcon.visible = false;
            
            // Position the C icon at the top right of the screen
            cIcon.position.set(
                window.innerWidth - 50, // Adjust for your layout
                50, // Adjust for your layout
                0
            );
            
            // Display text instruction
            displayText('Press C to collect');
        } 
        // D icon only shown when carrying a seed
        else if (isCarryingSeed) {
            cIcon.visible = false;
            dIcon.visible = true;
            
            // Position the D icon at the top right of the screen
            dIcon.position.set(
                window.innerWidth - 50, // Adjust for your layout
                50, // Adjust for your layout
                0
            );
            
            // Display text instruction
            displayText('Press D to drop');
        }
        // Hide both when not near seeds and not carrying
        else {
            cIcon.visible = false;
            dIcon.visible = false;
            displayText(''); // Clear text
        }
    }
    
    // Handle key press for seed pickup and drop
    handleSeedInteraction();
    
    // Animate water in the pond
    scene.traverse(function(object) {
        if (object.isWater) {
            object.update();
        }
    });
}
// Function to display text instructions
function displayText(message) {
    const textElement = document.getElementById('instructionText');
    if (textElement) {
        textElement.innerText = message;
    }
}

// Function to display text instructions
function displayText(message) {
    const textElement = document.getElementById('instructionText');
    if (textElement) {
        textElement.innerText = message;
    }
}
// Create a "D" icon to show when carrying a seed
function createDIcon() {
    // Create a circle with 'D' texture
    const iconGeometry = new THREE.CircleGeometry(0.3, 32);
    
    // Create canvas for drawing the D
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Draw circle background
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(64, 64, 60, 0, Math.PI * 2);
    context.fill();
    
    // Draw D letter
    context.fillStyle = '#000000';
    context.font = 'bold 80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('D', 64, 64);
    
    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    // Create material with transparency
    const iconMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const icon = new THREE.Mesh(iconGeometry, iconMaterial);
    
    return icon;
}

// Function to create a Ghibli-style pond
function createGhibliPond() {
    const pondGroup = new THREE.Group();

    // Create realistic flowing water using THREE.Water
    const waterGeometry = new THREE.CircleGeometry(8, 32);
    
    // Water properties for a Ghibli-style aesthetic
    const waterOptions = {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function(texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(-0.5, 0.7, 1.0),
        sunColor: 0xffffff,
        waterColor: 0x4488aa,  // A pleasing blue color
        distortionScale: 2.0,  // Increase wave distortion
        fog: false
    };
    
    const water = new THREE.Water(waterGeometry, waterOptions);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.05; // Slightly above ground level
    water.userData.isPond = true; // Mark as pond for splash detection
    
    // Add animation to make the water flow
    water.material.uniforms.time.value = 0;
    
    // Add update function to animate water
    water.update = function() {
        this.material.uniforms.time.value += 0.01;
    };
    
    pondGroup.add(water);
    
    // Add simple brown boundary around the pond
    const boundaryGeometry = new THREE.RingGeometry(8, 8.5, 32);
    const boundaryMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown color
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    
    const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    boundary.rotation.x = -Math.PI / 2;
    boundary.position.y = 0.02; // Slightly above ground
    pondGroup.add(boundary);
    
    // Add a few cute lily pads
    const lilyPadMaterial = new THREE.MeshStandardMaterial({
        color: 0x66bb6a,
        roughness: 0.5,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 3; i++) {
        // Create lily pad
        const lilyPadGeometry = new THREE.CircleGeometry(0.8, 16);
        const lilyPad = new THREE.Mesh(lilyPadGeometry, lilyPadMaterial);
        lilyPad.rotation.x = -Math.PI / 2;
        
        // Random position within the pond
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 6; // Keep within pond bounds
        lilyPad.position.set(
            Math.cos(angle) * radius,
            0.06, // Just above water
            Math.sin(angle) * radius
        );
        
        pondGroup.add(lilyPad);
    }
    
    // Position the pond on the right side of the grass area
    pondGroup.position.set(25, 0, 15);

    return pondGroup;
}

// Function to create a dirt patch
function createDirtPatch() {
    const dirtGroup = new THREE.Group();
    
    // Create the main dirt patch with an irregular shape
    const dirtShape = new THREE.Shape();
    
    // Create an irregular polygon for a natural dirt patch
    const points = [];
    const segments = 12;
    const baseRadius = 5; // Base size of the dirt patch
    
    // Generate random points around a circle to create irregular shape
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const radius = baseRadius * (0.8 + Math.random() * 0.4); // Vary the radius
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        points.push(new THREE.Vector2(x, y));
    }
    
    // Create the shape from points
    dirtShape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        dirtShape.lineTo(points[i].x, points[i].y);
    }
    dirtShape.closePath();
    
    // Create geometry from the shape
    const dirtGeometry = new THREE.ShapeGeometry(dirtShape);
    
    // Dark brown material for dirt
    const dirtMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2817, // Dark brown
        roughness: 1.0,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    
    const dirtPatch = new THREE.Mesh(dirtGeometry, dirtMaterial);
    dirtPatch.rotation.x = -Math.PI / 2; // Lay flat on the ground
    dirtPatch.position.y = 0.01; // Slightly above ground to prevent z-fighting
    
    dirtGroup.add(dirtPatch);
    
    // Add some texture details to the dirt
    for (let i = 0; i < 20; i++) {
        // Small stones and dirt clumps
        const detailGeometry = new THREE.CircleGeometry(0.2 * Math.random() + 0.1, 8);
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x3d2817).lerp(new THREE.Color(0x5a3a1f), Math.random()), // Vary the brown
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
        
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        
        // Random position within the dirt patch
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (baseRadius * 0.8);
        detail.position.set(
            Math.cos(angle) * radius,
            0.02, // Slightly above the dirt
            Math.sin(angle) * radius
        );
        
        detail.rotation.x = -Math.PI / 2; // Lay flat
        dirtGroup.add(detail);
    }
    
    // Position the dirt patch on the left side of the grass area
    dirtGroup.position.set(-25, 0, 15);
    
    return dirtGroup;
}

// Update the environment update function to animate the water
function updateEnvironment() {
    if (!zowieCharacter) return;
    
    // Existing code for Zowie position and seed interaction
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
    
    // Update icons visibility
    if (cIcon && dIcon) {
        // C icon only shown when near seeds and not carrying
        if (!isCarryingSeed && nearAnySeed && seedsArray.length > 0) {
            cIcon.visible = true;
            dIcon.visible = false;
            
            // Position the C icon at the top right of the screen
            cIcon.position.set(
                window.innerWidth - 50, // Adjust for your layout
                50, // Adjust for your layout
                0
            );
            
            // Display text instruction
            displayText('Press C to collect');
        } 
        // D icon only shown when carrying a seed
        else if (isCarryingSeed) {
            cIcon.visible = false;
            dIcon.visible = true;
            
            // Position the D icon at the top right of the screen
            dIcon.position.set(
                window.innerWidth - 50, // Adjust for your layout
                50, // Adjust for your layout
                0
            );
            
            // Display text instruction
            displayText('Press D to drop');
        }
        // Hide both when not near seeds and not carrying
        else {
            cIcon.visible = false;
            dIcon.visible = false;
            displayText(''); // Clear text
        }
    }
    
    // Handle key press for seed pickup and drop
    handleSeedInteraction();
    
    // Animate water in the pond
    scene.traverse(function(object) {
        if (object.isWater) {
            object.update();
        }
    });
}
