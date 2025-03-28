// Environment elements
let sky, stars, ground, campusPaths, collegeBuildings, palmTrees, benches, balloons;

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
    
    balloons = createBalloons();
    scene.add(balloons);
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

// Balloons
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
