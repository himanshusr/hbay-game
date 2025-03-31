function init() {
    // Set up the scene, camera, renderer, and lighting
    setupScene();
    
    // Set up environment elements
    setupEnvironment();
    
    // Set up keyboard controls
    setupKeyboardControls();
    
    // Load character models
    loadCharacters();
    
    // Set up profile placeholders
    createGhibliPlaceholder('Himanshu', 20);
    createGhibliPlaceholder('Zowie', 130);
    
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
    for (let i = 0; i < particleCount; i++) {
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

// Create an ultra-cute Ghibli-style birthday message with enhanced styling
window.showGhibliBirthdayMessage = function() {
    console.log("Showing enhanced Ghibli birthday message");
    
    // Create a div for the message
    const messageContainer = document.createElement('div');
    messageContainer.id = 'ghibli-birthday-message';
    messageContainer.style.position = 'absolute';
    messageContainer.style.top = '50%';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translate(-50%, -50%)';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.zIndex = '1000';
    
    // Try to load a cuter font first, with fallbacks
    messageContainer.style.fontFamily = '"Mochiy Pop One", "Bubblegum Sans", "Comic Sans MS", cursive, sans-serif';
    
    // Add Google Font for cute Japanese-inspired font (Mochiy Pop One)
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Bubblegum+Sans&display=swap';
    document.head.appendChild(fontLink);
    
    // Add white border and enhanced styling
    messageContainer.style.color = '#ff6699'; // Brighter pink color
    messageContainer.style.textShadow = '0 0 10px #fff, 0 0 15px #ffccff, 0 0 20px #ff99cc';
    messageContainer.style.border = '6px solid white'; // Add white border
    messageContainer.style.borderRadius = '25px'; // Rounded corners
    messageContainer.style.boxShadow = '0 0 15px white, 0 0 25px #ffccff'; // Glowing border
    messageContainer.style.padding = '15px 30px'; // Add some padding
    messageContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; // Very slight white background
    messageContainer.style.backdropFilter = 'blur(2px)'; // Subtle blur effect
    messageContainer.style.opacity = '0';
    messageContainer.style.transition = 'opacity 2s';
    
    // Create more decorative top elements
    const topDecoration = document.createElement('div');
    topDecoration.style.fontSize = '38px';
    topDecoration.style.marginBottom = '15px';
    topDecoration.style.color = '#ffaacc';
    topDecoration.innerHTML = '✿ ❀ ✿ ❀ ✿ ❀ ✿';
    topDecoration.style.textShadow = '0 0 8px #ffffff';
    
    // Add tiny animated totoro-like spirits
    const spirits = document.createElement('div');
    spirits.style.fontSize = '32px';
    spirits.style.marginBottom = '10px';
    spirits.innerHTML = '⚪ ⚫ ⚪';
    spirits.style.animation = 'bounce 2s infinite alternate';
    
    // Create main message with enhanced styling
    const mainMessage = document.createElement('div');
    mainMessage.style.fontSize = '46px';
    mainMessage.style.marginBottom = '15px';
    mainMessage.style.fontWeight = 'bold';
    mainMessage.style.letterSpacing = '1px';
    mainMessage.textContent = 'Belated Happy Birthday Zowie!';
    mainMessage.style.animation = 'glow 2s infinite alternate';
    
    // Create secondary message
    const secondaryMessage = document.createElement('div');
    secondaryMessage.style.fontSize = '32px';
    secondaryMessage.style.marginBottom = '5px';
    secondaryMessage.textContent = 'You\'re the best!';
    
    // Add sparkles
    const sparkles = document.createElement('div');
    sparkles.style.fontSize = '30px';
    sparkles.style.marginBottom = '15px';
    sparkles.innerHTML = '✨ ✨ ✨';
    sparkles.style.animation = 'sparkle 1.5s infinite alternate';
    
    // Bottom decoration
    const bottomDecoration = document.createElement('div');
    bottomDecoration.style.fontSize = '38px';
    bottomDecoration.style.marginTop = '10px';
    bottomDecoration.style.color = '#ffaacc';
    bottomDecoration.innerHTML = '✿ ❀ ✿ ❀ ✿ ❀ ✿';
    bottomDecoration.style.textShadow = '0 0 8px #ffffff';
    
    // Add style for animations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes float {
            0% { transform: translate(-50%, -50%); }
            50% { transform: translate(-50%, -53%); }
            100% { transform: translate(-50%, -50%); }
        }
        @keyframes glow {
            0% { text-shadow: 0 0 10px #fff, 0 0 20px #ff99cc; }
            100% { text-shadow: 0 0 15px #fff, 0 0 30px #ff66aa, 0 0 40px #ff99ff; }
        }
        @keyframes sparkle {
            0% { opacity: 0.7; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-8px); }
        }
        #ghibli-birthday-message {
            animation: float 4s ease-in-out infinite;
        }
    `;
    document.head.appendChild(styleElement);
    
    // Assemble the message with all decorative elements
    messageContainer.appendChild(topDecoration);
    messageContainer.appendChild(spirits);
    messageContainer.appendChild(mainMessage);
    messageContainer.appendChild(sparkles);
    messageContainer.appendChild(secondaryMessage);
    messageContainer.appendChild(bottomDecoration);
    
    // Add to document
    document.body.appendChild(messageContainer);
    
    // Fade in the message
    setTimeout(() => {
        messageContainer.style.opacity = '1';
    }, 500);
    
    // Fade out after some time
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageContainer);
            document.head.removeChild(styleElement);
        }, 2000);
    }, 10000); // Display for longer (10 seconds)
};