// environment/sky.js

// Function to create a gradient sky
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

// Function to create scattered stars
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
