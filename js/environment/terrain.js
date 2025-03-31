// environment/terrain.js

// Function to create the ground
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

// Function to create palm trees
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
