const canvas = document.getElementById('glCanvas');
const radiusSlider = document.getElementById('radiusSlider');

// Specify the size of the canvas
const canvasWidth = canvas.width;  // Use actual resolution
const canvasHeight = canvas.height; // Use actual resolution

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.Camera();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvasWidth, canvasHeight);

// Create a WebGL render target
const renderTarget = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight);

// Click Position and Dot Radius Uniform
const clickPosition = new THREE.Vector2(-2, -2); // Initialize off-screen
const uniforms = {
    uClickPosition: { value: clickPosition },
    uCanvasSize: { value: new THREE.Vector2(canvasWidth, canvasHeight) },
    uDotRadius: { value: parseFloat(radiusSlider.value) }, // New uniform for dot radius
    uRenderTargetTexture: { value: renderTarget.texture } // New uniform for render target texture
};

// Shader Material
const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec2 uClickPosition;
        uniform vec2 uCanvasSize;
        uniform float uDotRadius;
        uniform sampler2D uRenderTargetTexture; // Texture from render target

        void main() {
            float aspectRatio = uCanvasSize.x / uCanvasSize.y;
            vec2 normCoords = gl_FragCoord.xy / uCanvasSize;
            vec2 adjustedClickPos = uClickPosition;

            // Adjust only the x-coordinate for the aspect ratio
            float dx = (normCoords.x - adjustedClickPos.x) * aspectRatio;
            float dy = normCoords.y - adjustedClickPos.y;

            // Calculate the distance, taking the aspect ratio into account
            float dist = sqrt(dx * dx + dy * dy);
            if (dist < uDotRadius) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White dot
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black background
            }
            // Additional diffusion logic using uRenderTargetTexture can be added here
        }
    `
});

// Fullscreen Quad
const plane = new THREE.PlaneGeometry(2, 2);
const quad = new THREE.Mesh(plane, material);
scene.add(quad);

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvasWidth;
    const y = 1 - (event.clientY - rect.top) / canvasHeight; // Invert Y

    clickPosition.set(x, y);
    renderDot(); // Render the dot to the render target
});

radiusSlider.addEventListener('input', () => {
    uniforms.uDotRadius.value = parseFloat(radiusSlider.value);
});

function renderDot() {
    renderer.setRenderTarget(renderTarget); // Render to the render target
    renderer.render(scene, camera);
    renderer.setRenderTarget(null); // Reset to render to the canvas
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera); // Render the scene for display
}
animate();
