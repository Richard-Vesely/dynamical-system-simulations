// Get the canvas element and its context
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
}

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;

// Fragment shader program
const fsSource = `
    precision mediump float;
    uniform vec2 uClickPosition;
    void main() {
        float dist = distance(gl_FragCoord.xy, uClickPosition);
        if (dist < 50.0) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White dot
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black background
        }
    }
`;

// Initialize shaders
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const clickPosUniform = gl.getUniformLocation(shaderProgram, 'uClickPosition');

// Initialize click position
let clickPosition = [-2, -2]; // Start off-screen

// Create a buffer for the square's positions.
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// An array of positions for the square (two triangles to form a square).
const positions = [
    -1.0,  1.0,
    -1.0, -1.0,
     1.0,  1.0,
     1.0, -1.0,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vertexPosition);

// Handle canvas click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to WebGL coordinates
    const webGLX = (x / canvas.width) * 2 - 1;
    const webGLY = (y / canvas.height) * -2 + 1; // WebGL y-coordinates are flipped

    clickPosition = [webGLX, webGLY];
    drawScene();
});

// Draw the scene
function drawScene() {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use our shader program
    gl.useProgram(shaderProgram);
    // Set the uniform for click position
    gl.uniform2fv(clickPosUniform, clickPosition);

    // Draw the square
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Initial draw
drawScene();

// Initialize a shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
