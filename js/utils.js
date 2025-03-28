// Global constants and variables
const PARAMS = {
    walkSpeed: 0.1,
    rotationSpeed: 0.1,
    targetHeight: 2
};

// Logger utility
function log(message) {
    console.log(message);
}

// Calculate appropriate scale for models
function getAppropriateScale(object) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    let scale = PARAMS.targetHeight / size.y;
    scale = Math.max(0.01, Math.min(scale, 10));
    return scale;
}

// UI Elements
function showLoadingComplete() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    const instructionsElement = document.getElementById('instructions');
    if (instructionsElement) {
        instructionsElement.style.opacity = '1';
    }
}

// Create placeholder profile images
function createGhibliPlaceholder(name, topPosition) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    // Soft pastel background with subtle transparency
    context.fillStyle = 'rgba(255, 245, 230, 0.8)'; 
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Simple Ghibli-style balloon shape
    context.beginPath();
    context.arc(64, 64, 40, 0, Math.PI * 2); 
    context.fillStyle = name === 'Himanshu' ? '#ffb07a' : '#ffcccb'; 
    context.fill();
    context.closePath();

    // Minimalistic string
    context.beginPath();
    context.moveTo(64, 104);
    context.lineTo(64, 120);
    context.strokeStyle = '#8d6e63'; 
    context.lineWidth = 2;
    context.stroke();

    // Cute text
    context.font = '20px "Comic Sans MS", cursive, sans-serif';
    context.fillStyle = '#ff69b4';
    context.textAlign = 'center';
    context.fillText(name, 64, 50);

    // Subtle shadow for depth
    context.shadowColor = 'rgba(0, 0, 0, 0.2)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    const img = document.createElement('img');
    if (name === 'Himanshu') {
        img.src = 'assets/images/himanshu_profile.png';
    } else if (name === 'Zowie') {
        img.src = 'assets/images/zowie_profile.png';
    }
    img.style.position = 'absolute';
    img.style.left = '20px';
    img.style.top = `${topPosition}px`;
    img.style.width = '100px';
    img.style.height = '100px';
    img.style.zIndex = '10';
    img.style.borderRadius = '10px';
    img.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
    document.body.appendChild(img);
}
