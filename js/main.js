function init() {
    // Set up the scene, camera, renderer, and lighting
    setupScene();
    
    // Set up environment elements
    setupEnvironment();
    
    // Set up keyboard controls
    setupKeyboardControls();
    
    // Set up touch DRAG controls (will only activate on mobile)
    setupDragControls();
    
    // Set up touch ACTION buttons
    setupActionButtons();
    
    // Load character models
    loadCharacters();
    
    // Set up profile placeholders
    createGhibliPlaceholder('Himanshu', 20);
    createGhibliPlaceholder('Zowie', 130);
    
    // Cache button elements after setup
    if (typeof cacheButtonElements === 'function') {
        cacheButtonElements();
    }
    
    // Start animation loop
    animate();
}

// Start the application
window.addEventListener('DOMContentLoaded', init);

// Create an enhanced, more pronounced confetti effect
window.createConfettiEffect = function() {
    console.log("Creating enhanced confetti effect");
    const particleCount = 500; // Increased from 300 to 500 for much more confetti
    const colors = [
        0xFF9999, // Pink
        0x88CCFF, // Light blue
        0xFFFF99, // Light yellow
        0x99FF99, // Light green
        0xFFCC99, // Peach
        0xCC99FF, // Lavender
        0xFF88FF, // Bright pink
        0xAAFFFF, // Cyan
        0xFFB3DE, // Light rose
        0xC1F7DC  // Mint
    ];
    
    const confettiGroup = new THREE.Group();
    scene.add(confettiGroup);
    
    // Create confetti particles
    for (let i = 0; i < 5000; i++) {
        // More variety in confetti shapes
        let geometry;
        const shapeType = i % 5; // Increased shape variety
        if (shapeType === 0) {
            // Larger rectangle
            geometry = new THREE.PlaneGeometry(0.15, 0.25);
        } else if (shapeType === 1) {
            // Circle
            geometry = new THREE.CircleGeometry(0.1, 8);
        } else if (shapeType === 2) {
            // Star-like shape
            geometry = new THREE.CircleGeometry(0.12, 5);
        } else if (shapeType === 3) {
            // Heart-like shape (simplified)
            geometry = new THREE.CircleGeometry(0.1, 3);
        } else {
            // Tiny square
            geometry = new THREE.PlaneGeometry(0.08, 0.08);
        }
        
        // Random color from our expanded pastel palette
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            side: THREE.DoubleSide
        });
        
        const confetti = new THREE.Mesh(geometry, material);
        
        // Wider spread for more dramatic effect
        confetti.position.set(
            (Math.random() - 0.5) * 20, // Even wider horizontal spread
            10 + Math.random() * 10,     // Higher starting point
            -22 + (Math.random() - 0.5) * 10 // Wider spread near door
        );
        
        // Random rotation for more natural look
        confetti.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        // More dynamic velocity
        confetti.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.18, // Increased horizontal movement
            -0.02 - Math.random() * 0.1,  // Slower fall for longer visibility
            (Math.random() - 0.5) * 0.18  // Increased depth movement
        );
        
        // More pronounced rotation
        confetti.userData.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        // Longer lifetime
        confetti.userData.lifetime = 5 + Math.random() * 8; // 5-13 seconds
        
        confettiGroup.add(confetti);
    }
    
    // Enhanced animation for confetti
    const animateConfetti = () => {
        let anyActive = false;
        
        confettiGroup.children.forEach(confetti => {
            if (confetti.userData.lifetime > 0) {
                // Update position with more dynamic movement
                confetti.position.add(confetti.userData.velocity);
                
                // Add more pronounced swaying motion
                confetti.userData.velocity.x += (Math.random() - 0.5) * 0.018;
                confetti.userData.velocity.z += (Math.random() - 0.5) * 0.018;
                
                // Occasionally add small upward bursts for more dynamic movement
                if (Math.random() < 0.015) {
                    confetti.userData.velocity.y += Math.random() * 0.06;
                }
                
                // Update rotation more dramatically
                confetti.rotation.x += confetti.userData.rotationSpeed.x;
                confetti.rotation.y += confetti.userData.rotationSpeed.y;
                confetti.rotation.z += confetti.userData.rotationSpeed.z;
                
                // Reduce lifetime
                confetti.userData.lifetime -= 0.016;
                
                // Fade out near end of lifetime
                if (confetti.userData.lifetime < 1) {
                    confetti.material.opacity = confetti.userData.lifetime;
                    confetti.material.transparent = true;
                }
                
                anyActive = true;
            } else {
                confetti.visible = false;
            }
        });
        
        if (anyActive) {
            requestAnimationFrame(animateConfetti);
        } else {
            scene.remove(confettiGroup);
            confettiGroup.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
    };
    
    animateConfetti();
};

// Create a minimalistic yet cool Ghibli-style birthday message
window.showGhibliBirthdayMessage = function() {
    console.log("Showing minimalistic Ghibli birthday message");
    
    // Create a div for the message
    const messageContainer = document.createElement('div');
    messageContainer.id = 'ghibli-birthday-message';
    messageContainer.style.position = 'absolute';
    messageContainer.style.top = '50%';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translate(-50%, -50%)';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.zIndex = '1000';
    messageContainer.style.width = '500px';
    messageContainer.style.maxWidth = '90vw';
    
    // Keep the same font
    messageContainer.style.fontFamily = '"Mochiy Pop One", sans-serif';
    
    // Add Google Font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap';
    document.head.appendChild(fontLink);
    
    // Clean, minimalistic styling with warm Ghibli peach tones
    messageContainer.style.color = '#e08e60';
    messageContainer.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.8)';
    messageContainer.style.border = '3px solid rgba(255, 255, 255, 0.7)';
    messageContainer.style.borderRadius = '12px';
    messageContainer.style.boxShadow = '0 0 20px rgba(255, 219, 187, 0.6)';
    messageContainer.style.padding = '30px';
    messageContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
    messageContainer.style.backdropFilter = 'blur(1px)';
    messageContainer.style.opacity = '0';
    messageContainer.style.transition = 'opacity 1.5s';
    
    // Create a subtle Ghibli-inspired landscape background
    const backgroundScene = document.createElement('div');
    backgroundScene.style.position = 'absolute';
    backgroundScene.style.bottom = '0';
    backgroundScene.style.left = '0';
    backgroundScene.style.width = '100%';
    backgroundScene.style.height = '30%';
    backgroundScene.style.opacity = '0.4';
    backgroundScene.style.zIndex = '-1';
    backgroundScene.style.fontSize = '18px';
    backgroundScene.style.textAlign = 'center';
    backgroundScene.style.pointerEvents = 'none';
    
    // Simple, elegant main message with darker color
    const mainMessage = document.createElement('div');
    mainMessage.style.fontSize = '52px';
    mainMessage.style.fontWeight = 'bold';
    mainMessage.style.marginBottom = '20px';
    mainMessage.style.letterSpacing = '1px';
    mainMessage.style.color = '#c27442'; // Darker, more solid version of the peach
    mainMessage.textContent = 'Happy Birthday Zowie';
    mainMessage.style.animation = 'pulse 3s infinite alternate';
    
    // Add Ghibli scene elements in a minimalistic way
    const sceneTop = document.createElement('div');
    sceneTop.style.fontSize = '20px';
    sceneTop.style.marginBottom = '15px';
    sceneTop.style.opacity = '0.8';
    sceneTop.style.color = '#d9916b';
    sceneTop.innerHTML = '✦ ✧ ✦ ⋆ ✧ ⋆ ✦'; // Stars in the sky
    
    const sceneMiddle = document.createElement('div');
    sceneMiddle.style.fontSize = '16px';
    sceneMiddle.style.margin = '25px auto 15px';
    sceneMiddle.style.color = '#d9916b';
    sceneMiddle.style.letterSpacing = '3px';
    sceneMiddle.innerHTML = '🏠 &nbsp; 🌲 &nbsp; 🎃 &nbsp; 🌲 &nbsp; 🏠'; // Houses, trees, pumpkin
    
    // Add style for subtle animations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes float {
            0% { transform: translate(-50%, -50%); }
            100% { transform: translate(-50%, -52%); }
        }
        @keyframes pulse {
            0% { opacity: 0.96; }
            100% { opacity: 1; text-shadow: 0 0 12px rgba(255,255,255,0.8), 0 0 20px rgba(231,160,128,0.8); }
        }
        @keyframes twinkle {
            0% { opacity: 0.4; }
            100% { opacity: 0.8; }
        }
        #ghibli-birthday-message {
            animation: float 3s ease-in-out infinite alternate;
        }
        #ghibli-birthday-message:after {
            content: '';
            position: absolute;
            top: -8px;
            left: -8px;
            right: -8px;
            bottom: -8px;
            border: 1px solid rgba(255, 219, 187, 0.3);
            border-radius: 16px;
            pointer-events: none;
        }
    `;
    document.head.appendChild(styleElement);
    
    // Assemble the message
    messageContainer.appendChild(sceneTop); // Stars at top
    messageContainer.appendChild(mainMessage); // Main birthday message
    messageContainer.appendChild(sceneMiddle); // Scene with houses, trees, pumpkin
    
    // Add to document
    document.body.appendChild(messageContainer);
    
    // Fade in the message
    setTimeout(() => {
        messageContainer.style.opacity = '1';
    }, 300);
    
    // Fade out after some time
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageContainer);
            document.head.removeChild(styleElement);
        }, 1500);
    }, 15000);
};