const canvas = document.getElementById('glCanvas');
const nRectangles = 100; // Set the number of rectangles here
const maxDecayRate = 0.01; // Set the maximum decay rate here
const canvasWidth = canvas.width = 800; // Set canvas width
const canvasHeight = canvas.height = 800; // Set canvas height
const nthRectangleSlider = document.getElementById('nthRectangleSlider');
const sliderValueDisplay = document.getElementById('sliderValue');
const decayRateSlider = document.getElementById('decayRateSlider');
const decayRateValueDisplay = document.getElementById('decayRateValue');
const resetSceneButton = document.getElementById('resetSceneButton');

nthRectangleSlider.max = nRectangles - 1;
sliderValueDisplay.textContent = nthRectangleSlider.value;

decayRateSlider.max = maxDecayRate;
decayRateValueDisplay.textContent = decayRateSlider.value;


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

const uniforms = {
    uTexture: { value: null },
    decayRate: { value: 0.01 },
    nthRectangle: {value: parseInt(nthRectangleSlider.value)},
    nRectangles: { value: nRectangles },
    decayRate: {value:parseFloat(decayRateSlider.value)}
}

// Shader Material
const decayMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
    uniform sampler2D uTexture;
    uniform float decayRate;
    uniform int nthRectangle;
    uniform int nRectangles;

    void main() {
        vec2 uv = gl_FragCoord.xy / vec2(${canvasWidth.toFixed(1)}, ${canvasHeight.toFixed(1)});
        float currentIntensity = texture2D(uTexture, uv).r;

        // Apply exponential decay only to the left half of the screen
        if (gl_FragCoord.x < ${canvasWidth.toFixed(1)} / 2.0) {
            currentIntensity *= (1.0 - decayRate);
        }
        // Right side: horizontal rectangles with varying intensity
        else {
            int segment = int(gl_FragCoord.y / (${canvasHeight.toFixed(1)} / float(nRectangles)));
            currentIntensity = 1.0 - float(segment) / float(nRectangles - 1);
    
            // Highlight the nth rectangle
            if (segment == nthRectangle) {
                currentIntensity = 1.0;
            }
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

nthRectangleSlider.addEventListener('input', () => {
    decayMaterial.uniforms.nthRectangle.value = parseInt(nthRectangleSlider.value);
    sliderValueDisplay.textContent = nthRectangleSlider.value;
});

decayRateSlider.addEventListener('input', () => {
    decayMaterial.uniforms.decayRate.value = parseFloat(decayRateSlider.value);
    decayRateValueDisplay.textContent = decayRateSlider.value;
});

// Set initial texture for uTexture
decayMaterial.uniforms.uTexture.value = renderTargetA.texture;

// Swap Render Targets Function
function swapRenderTargets() {
    let temp = currentRenderTarget;
    currentRenderTarget = nextRenderTarget;
    nextRenderTarget = temp;
}

resetSceneButton.addEventListener('click', () => {
    initializeRenderTargetWithWhite(renderTargetA);
    initializeRenderTargetWithWhite(renderTargetB);
    decayMaterial.uniforms.uTexture.value = renderTargetA.texture;
});

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
