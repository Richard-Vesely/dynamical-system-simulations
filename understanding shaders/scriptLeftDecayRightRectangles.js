const canvas = document.getElementById('glCanvas');
const canvasWidth = canvas.width = 800; // Set canvas width
const canvasHeight = canvas.height = 800; // Set canvas height

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.Camera();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvasWidth, canvasHeight);

// Create two render targets for ping-pong rendering
const renderTargetA = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight);
const renderTargetB = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight);
let currentRenderTarget = renderTargetA;
let nextRenderTarget = renderTargetB;

// Shader Material
const decayMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTexture: { value: null },
        decayRate: { value: 0.01 }
    },
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
    uniform sampler2D uTexture;
    uniform float decayRate;

    void main() {
        vec2 uv = gl_FragCoord.xy / vec2(${canvasWidth.toFixed(1)}, ${canvasHeight.toFixed(1)});
        float currentIntensity = texture2D(uTexture, uv).r;

        // Apply exponential decay only to the left half of the screen
        if (gl_FragCoord.x < ${canvasWidth.toFixed(1)} / 2.0) {
            currentIntensity *= (1.0 - decayRate);
        }
        // Right side: horizontal rectangles with varying intensity
        else {
            int n = 50; // Number of segments
            // Determine which segment the current pixel belongs to
            int segment = int(gl_FragCoord.y / (${canvasHeight.toFixed(1)} / float(n)));
            // Calculate intensity for each segment (1 for the topmost, 0 for the bottommost)
            currentIntensity = 1.0 - float(segment) / float(n - 1);
        }

        gl_FragColor = vec4(currentIntensity, currentIntensity, currentIntensity, 1.0);
    }
`

});

// Fullscreen Quad
const plane = new THREE.PlaneGeometry(2, 2);
const quad = new THREE.Mesh(plane, decayMaterial);
scene.add(quad);

// Initialize Render Targets
function initializeRenderTargetWithWhite(target) {
    renderer.setRenderTarget(target);
    renderer.setClearColor(new THREE.Color('white')); // Set clear color to white
    renderer.clear(true, true, true);
}

initializeRenderTargetWithWhite(renderTargetA);
initializeRenderTargetWithWhite(renderTargetB);

// Set initial texture for uTexture
decayMaterial.uniforms.uTexture.value = renderTargetA.texture;

// Swap Render Targets Function
function swapRenderTargets() {
    let temp = currentRenderTarget;
    currentRenderTarget = nextRenderTarget;
    nextRenderTarget = temp;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update the texture uniform to the current target
    decayMaterial.uniforms.uTexture.value = currentRenderTarget.texture;

    // Render to the next target
    renderer.setRenderTarget(nextRenderTarget);
    renderer.render(scene, camera);
    swapRenderTargets();

    // Render the current state to the canvas for display
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
}

animate();
