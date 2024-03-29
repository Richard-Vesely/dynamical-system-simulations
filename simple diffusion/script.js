const canvas = document.getElementById('glCanvas');
const radiusSlider = document.getElementById('radiusSlider');
const decaySlider = document.getElementById('decaySlider');
const canvasWidth = canvas.width; // Actual resolution
const canvasHeight = canvas.height; // Actual resolution

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.Camera();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
const gl = renderer.getContext();
const ext = gl.getExtension('OES_texture_float');
if (!ext) {
    console.error('Floating point textures not supported');
    // Handle the lack of support for floating point textures.
    // For example, you might want to alert the user or use a different rendering approach.
    // alert("Your device or browser does not support floating point textures, which are required for this application.");
    // You can also set a flag or take other appropriate actions based on your application's requirements.
}
renderer.setSize(canvasWidth, canvasHeight);

// Create two render targets for ping-pong rendering
const options = {
    type: THREE.FloatType, // Use floating point textures
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter
};

const renderTargetA = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight, options);
const renderTargetB = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight, options);

let currentRenderTarget = renderTargetA;
let nextRenderTarget = renderTargetB;

// Click Position and Decay Rate Uniforms
const clickPosition = new THREE.Vector2(-2, -2); // Initialize off-screen

const uniforms = {
    uClickPosition: { value: clickPosition },
    uCanvasSize: { value: new THREE.Vector2(canvasWidth, canvasHeight) },
    uDecayRate: { value: parseFloat(decaySlider.value) },
    uTexture: { value: null }, // Texture from the current render target
    uDotRadius: { value: parseFloat(radiusSlider.value)}
};



// Shader Material
const decayMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision highp float;
        uniform sampler2D uTexture;
        uniform float uDecayRate;
        uniform vec2 uCanvasSize;

        void main() {
            vec2 uv = gl_FragCoord.xy / uCanvasSize;
            float currentIntensity = texture2D(uTexture, uv).r;

            // Apply decay to the intensity
            float nextIntensity = currentIntensity - uDecayRate*currentIntensity;

            gl_FragColor = vec4(nextIntensity, nextIntensity, nextIntensity, 1.0);
        }
    `
});

const clickMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision highp float;
        uniform vec2 uClickPosition;
        uniform vec2 uCanvasSize;
        uniform float uDotRadius;
        uniform sampler2D uTexture;

        void main() {
            vec2 uv = gl_FragCoord.xy / uCanvasSize;
            float dist = distance(uv, uClickPosition);

            // Check if the current pixel is close to the click position
            float currentIntensity = texture2D(uTexture, uv).r;
            if(dist < uDotRadius) {
                currentIntensity = 1.0; // Maximum intensity for a new dot
            }

            gl_FragColor = vec4(currentIntensity, currentIntensity, currentIntensity, 1.0);
        }
    `
});

// Fullscreen Quad
const plane = new THREE.PlaneGeometry(2, 2);
const quad = new THREE.Mesh(plane, decayMaterial); // Initially use decayMaterial
scene.add(quad);

// Initialize Render Targets
function initializeRenderTargets() {
    renderer.setRenderTarget(renderTargetA);
    renderer.clearColor(0, 0, 0, 1); // Clear with black color
    renderer.clear();
    renderer.setRenderTarget(renderTargetB);
    renderer.clear();
    renderer.setRenderTarget(null);
}
initializeRenderTargets();


// Set initial texture for uTexture
uniforms.uTexture.value = renderTargetA.texture;

// Mouse Click Event
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvasWidth;
    const y = 1 - (event.clientY - rect.top) / canvasHeight; // Invert Y

    clickPosition.set(x, y);
    renderDot(); // Render the new dot
});
radiusSlider.addEventListener('input', () => {
    uniforms.uDotRadius.value = parseFloat(radiusSlider.value);
});

// Update decay rate uniform based on slider input
decaySlider.addEventListener('input', () => {
    uniforms.uDecayRate.value = parseFloat(decaySlider.value);
});

// Render Dot Function (Called on Click)
function renderDot() {
    quad.material = clickMaterial; // Use click shader
    uniforms.uTexture.value = currentRenderTarget.texture;
    renderer.setRenderTarget(nextRenderTarget);
    renderer.render(scene, camera);
    swapRenderTargets();
}

function applyDecay() {
    quad.material = decayMaterial; // Use decay shader
    uniforms.uTexture.value = currentRenderTarget.texture;
    renderer.setRenderTarget(nextRenderTarget);
    renderer.render(scene, camera);
    swapRenderTargets();
}


// Swap Render Targets Function
function swapRenderTargets() {
    let temp = currentRenderTarget;
    currentRenderTarget = nextRenderTarget;
    nextRenderTarget = temp;
}

// Animation Loop (with Continuous Decay)
function animate() {
    requestAnimationFrame(animate);
    applyDecay();

    // Render the current state to the canvas for display
    renderer.setRenderTarget(null);
    uniforms.uTexture.value = currentRenderTarget.texture;
    renderer.render(scene, camera);
}
animate();


