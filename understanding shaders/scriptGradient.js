const canvas = document.getElementById('glCanvas');
const canvasWidth = canvas.width = 800; // Set canvas width
const canvasHeight = canvas.height = 800; // Set canvas height

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.Camera();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvasWidth, canvasHeight);

// Shader Material
const gradientShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            // Calculate the fraction of the position along the x-axis
            float fraction = gl_FragCoord.x / ${canvasWidth.toFixed(1)};

            // Calculate intensity: 1.0 (white) on the left, 0.0 (black) on the right
            float intensity = 1.0 - fraction;

            gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
        }
    `
});

// Fullscreen Quad
const plane = new THREE.PlaneGeometry(2, 2);
const quad = new THREE.Mesh(plane, gradientShaderMaterial);
scene.add(quad);

// Render the scene
renderer.render(scene, camera);
