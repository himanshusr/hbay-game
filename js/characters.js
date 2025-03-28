// Character-related variables
let yourCharacter, zowieCharacter;
let yourMixer, zowieMixer;
let yourWalkAnimation, zowieWalkAnimation;
let yourIdleAnimation, zowieIdleAnimation;
let isWalking = false;
let hasStartedWalking = false;
let modelsLoaded = 0;
let currentYourAnimation = null;
let currentZowieAnimation = null;

// Load characters and their animations
function loadCharacters() {
    const loader = new THREE.FBXLoader();
    
    // Load your character
    loader.load(
        'assets/models/new_hsr_final.fbx',
        function(object) {
            yourCharacter = object;
            const fixedHeight = 1.5;
            yourCharacter.position.set(-1, fixedHeight, 0);
            const scale = getAppropriateScale(object) * 1.3;
            yourCharacter.scale.set(scale, scale, scale);
            
            // Make HSR character color lighter
            yourCharacter.traverse(function(child) {
                if (child.isMesh && child.material) {
                    // Handle array of materials
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => {
                            if (material.color) {
                                // Lighten the color by increasing RGB values
                                material.color.r = Math.min(1, material.color.r * 1.3);
                                material.color.g = Math.min(1, material.color.g * 1.3);
                                material.color.b = Math.min(1, material.color.b * 1.3);
                            }
                        });
                    } 
                    // Handle single material
                    else if (child.material.color) {
                        // Lighten the color by increasing RGB values
                        child.material.color.r = Math.min(1, child.material.color.r * 1.3);
                        child.material.color.g = Math.min(1, child.material.color.g * 1.3);
                        child.material.color.b = Math.min(1, child.material.color.b * 1.3);
                    }
                }
            });
            
            scene.add(yourCharacter);
            
            log(`HSR character loaded and positioned at y=${fixedHeight}, scale=${scale}`);
            
            yourMixer = new THREE.AnimationMixer(yourCharacter);
            
            // Load walk animation
            loadAnimation(loader, 'assets/models/new_hsr_inplace.fbx', 
                (animObject) => {
                    log('HSR walk animation loaded');
                    if (animObject.animations && animObject.animations.length > 0) {
                        yourWalkAnimation = yourMixer.clipAction(animObject.animations[0]);
                        yourWalkAnimation.setEffectiveTimeScale(1);
                        yourWalkAnimation.setEffectiveWeight(1);
                        yourWalkAnimation.loop = THREE.LoopRepeat;
                    }
                }
            );
            
            // Load idle animation
            loadAnimation(loader, 'assets/models/new_hsr_idle.fbx', 
                (animObject) => {
                    log('HSR idle animation loaded');
                    if (animObject.animations && animObject.animations.length > 0) {
                        yourIdleAnimation = yourMixer.clipAction(animObject.animations[0]);
                        yourIdleAnimation.setEffectiveTimeScale(1);
                        yourIdleAnimation.setEffectiveWeight(1);
                        yourIdleAnimation.loop = THREE.LoopRepeat;
                        yourIdleAnimation.play(); // Start idle animation by default
                        currentYourAnimation = 'idle';
                    }
                }
            );
        }
    );
    
    // Load Zowie character
    loader.load(
        'assets/models/zowie_final.fbx',
        function(object) {
            zowieCharacter = object;
            const fixedHeight = 1.5;
            zowieCharacter.position.set(1, fixedHeight, 0);
            const scale = getAppropriateScale(object) * 1.1;
            zowieCharacter.scale.set(scale, scale, scale);
            scene.add(zowieCharacter);
            
            log(`Zowie character loaded and positioned at y=${fixedHeight}, scale=${scale}`);
            
            zowieMixer = new THREE.AnimationMixer(zowieCharacter);
            
            // Load walk animation
            loadAnimation(loader, 'assets/models/zowie_inplace.fbx', 
                (animObject) => {
                    log('Zowie walk animation loaded');
                    if (animObject.animations && animObject.animations.length > 0) {
                        zowieWalkAnimation = zowieMixer.clipAction(animObject.animations[0]);
                        zowieWalkAnimation.setEffectiveTimeScale(1);
                        zowieWalkAnimation.setEffectiveWeight(1);
                        zowieWalkAnimation.loop = THREE.LoopRepeat;
                    }
                }
            );
            
            // Load idle animation
            loadAnimation(loader, 'assets/models/zowie_idle.fbx', 
                (animObject) => {
                    log('Zowie idle animation loaded');
                    if (animObject.animations && animObject.animations.length > 0) {
                        zowieIdleAnimation = zowieMixer.clipAction(animObject.animations[0]);
                        zowieIdleAnimation.setEffectiveTimeScale(1);
                        zowieIdleAnimation.setEffectiveWeight(1);
                        zowieIdleAnimation.loop = THREE.LoopRepeat;
                        zowieIdleAnimation.play(); // Start idle animation by default
                        currentZowieAnimation = 'idle';
                    }
                }
            );
        }
    );
}

// Helper function to load animations
function loadAnimation(loader, path, onSuccess) {
    loader.load(
        path,
        function(animObject) {
            onSuccess(animObject);
            modelsLoaded++;
            checkAllLoaded();
        },
        undefined,
        function(error) {
            log('ERROR loading animation: ' + error);
            modelsLoaded++;
            checkAllLoaded();
        }
    );
}

// Check if all character models and animations are loaded
function checkAllLoaded() {
    if (modelsLoaded >= 4) { // 2 characters, 2 animations each
        showLoadingComplete();
    }
}

// Function to start walking animation
function startWalking() {
    if (!isWalking && yourWalkAnimation && zowieWalkAnimation) {
        isWalking = true;
        
        // Transition your character from idle to walk
        if (currentYourAnimation === 'idle') {
            yourIdleAnimation.fadeOut(0.2);
            yourWalkAnimation.reset();
            yourWalkAnimation.fadeIn(0.2);
            yourWalkAnimation.play();
            currentYourAnimation = 'walk';
        }
        
        // Transition Zowie character from idle to walk
        if (currentZowieAnimation === 'idle') {
            zowieIdleAnimation.fadeOut(0.2);
            zowieWalkAnimation.reset();
            zowieWalkAnimation.fadeIn(0.2);
            zowieWalkAnimation.play();
            currentZowieAnimation = 'walk';
        }
        
        hasStartedWalking = true;
    }
}

// Function to stop walking animation
function stopWalking() {
    if (isWalking && yourIdleAnimation && zowieIdleAnimation) {
        isWalking = false;
        
        // Transition your character from walk to idle
        if (currentYourAnimation === 'walk') {
            yourWalkAnimation.fadeOut(0.2);
            yourIdleAnimation.reset();
            yourIdleAnimation.fadeIn(0.2);
            yourIdleAnimation.play();
            currentYourAnimation = 'idle';
        }
        
        // Transition Zowie character from walk to idle
        if (currentZowieAnimation === 'walk') {
            zowieWalkAnimation.fadeOut(0.2);
            zowieIdleAnimation.reset();
            zowieIdleAnimation.fadeIn(0.2);
            zowieIdleAnimation.play();
            currentZowieAnimation = 'idle';
        }
    }
}
