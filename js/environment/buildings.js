// environment/buildings.js

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

