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

// Function to display text instructions
function displayText(message) {
    const textElement = document.getElementById('instructionText');
    if (textElement) {
        textElement.innerText = message;
    }
}
