
function eulerSimulate() {
    let topU = parseFloat(document.getElementById('top-u').value);
    let topV = parseFloat(document.getElementById('top-v').value);
    let leftU = parseFloat(document.getElementById('left-u').value);
    let leftV = parseFloat(document.getElementById('left-v').value);
    let rightU = parseFloat(document.getElementById('right-u').value);
    let rightV = parseFloat(document.getElementById('right-v').value);
    let bottomU = parseFloat(document.getElementById('bottom-u').value);
    let bottomV = parseFloat(document.getElementById('bottom-v').value);
    const simulationTime = parseFloat(document.getElementById('simulation-time').value);

    let f = parseFloat(document.getElementById('f').value);
    let du = parseFloat(document.getElementById('du').value);
    let dv = parseFloat(document.getElementById('dv').value);
    let k = parseFloat(document.getElementById('k').value);
    let u0 = parseFloat(document.getElementById('u0').value);
    let dt = 0.01;
    let t = 0, u = u0, v = 1 - u0;
    let us = [u0], vs = [1 - u0], ts = [0];

    while (t < simulationTime) {
        let laplacianU = calculateLaplacian(u,leftU,rightU,bottomU,topU); // Placeholder for laplacian calculation
        let laplacianV = calculateLaplacian(v,leftV,rightV,bottomV,topV); // Placeholder for laplacian calculation
        let duChange = dt * (du * laplacianU + u * Math.pow(v, 2) - (k + f) * u);
        let dvChange = dt * (dv * laplacianV - u * Math.pow(v, 2) + f * (1 - v));
        u += duChange;
        v += dvChange;
        t += dt;
        us.push(u);
        vs.push(v);
        ts.push(t);
    }

    return { ts, us, vs };
}
function calculateLaplacian(center, left, right, bottom, top) {
    return (-4 * center + left + right + bottom + top);
}
function setup() {
    let canvas = createCanvas(300, 300);
    canvas.parent('p5-container');
}

function draw() {
    background(220);
    drawGrid();
    updateGridColors();
}

function drawGrid() {
    let gridSize = 3;
    let cellSize = width / gridSize;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let cellX = x * cellSize;
            let cellY = y * cellSize;

            fill(255); // Default cell color

            if ((x === 0 || x === gridSize - 1) && (y === 0 || y === gridSize - 1)) {
                fill(0); // Corner cells black
            }

            if (x === 1 && y === 1) {
                fill(0, 0, 255); // Center cell blue
            }

            stroke(0);
            rect(cellX, cellY, cellSize, cellSize);
        }
    }
}

function updateGridColors() {
    let cellSize = width / 3;
    updateCellColor('top-u', 'top-v', cellSize, 0);
    updateCellColor('left-u', 'left-v', 0, cellSize);
    updateCellColor('right-u', 'right-v', 2 * cellSize, cellSize);
    updateCellColor('bottom-u', 'bottom-v', cellSize, 2 * cellSize);
}

function updateCellColor(uSliderId, vSliderId, x, y) {
    let cellSize = width / 3;
    let uValue = map(document.getElementById(uSliderId).value, 0, 1, 0, 255);
    let vValue = map(document.getElementById(vSliderId).value, 0, 1, 0, 255);
    fill(uValue, vValue, 0);
    rect(x, y, cellSize, cellSize);
}

function initializeGridSliderListeners() {
    const gridSliders = ['top-u', 'top-v', 'left-u', 'left-v', 'right-u', 'right-v', 'bottom-u', 'bottom-v'];
    
    gridSliders.forEach(sliderId => {
        document.getElementById(sliderId).addEventListener('input', () => {
            throttledUpdateGraph();
        });
    });
}

window.onload = function() {
    var board = JXG.JSXGraph.initBoard('box', {
        boundingbox: [-1, 2, 10, -1], 
        axis: true,
        keepaspectratio: false
    });

    board.create('text', [8, 1.8, "U concentration"], {fontSize: 18, color: '#00f'});
    board.create('text', [8, 1.6, "V concentration"], {fontSize: 18, color: '#f00'});

    var uSeries = board.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#00f'});
    var vSeries = board.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#f00'});

    function updateGraph() {

        const simulationTime = parseFloat(document.getElementById('simulation-time').value);
        const minX = -simulationTime * 0.06;
        const maxX = simulationTime;
        board.setBoundingBox([minX, 2, maxX, -1], false);

        let { ts, us, vs } = eulerSimulate();
     
        uSeries.dataX = ts;
        uSeries.dataY = us;
        uSeries.updateDataArray();
        vSeries.dataX = ts;
        vSeries.dataY = vs;
        vSeries.updateDataArray();
        board.update();
    }

    function updateSliderValues() {
        document.getElementById('f-value').innerText = document.getElementById('f').value;
        document.getElementById('du-value').innerText = document.getElementById('du').value;
        document.getElementById('dv-value').innerText = document.getElementById('dv').value;
        document.getElementById('k-value').innerText = document.getElementById('k').value;
        document.getElementById('u0-value').innerText = document.getElementById('u0').value;
        document.getElementById('simulation-time-value').innerText = document.getElementById('simulation-time').value;
    }

    let timeoutId;
    function throttledUpdateGraph() {
        clearTimeout(timeoutId);
        updateSliderValues();
        timeoutId = setTimeout(updateGraph, 100);
    }

    updateGraph();
    updateSliderValues();

    // Event listeners for model parameters
    document.getElementById('f').addEventListener('input', throttledUpdateGraph);
    document.getElementById('du').addEventListener('input', throttledUpdateGraph);
    document.getElementById('dv').addEventListener('input', throttledUpdateGraph);
    document.getElementById('k').addEventListener('input', throttledUpdateGraph);
    document.getElementById('u0').addEventListener('input', throttledUpdateGraph);
    document.getElementById('simulation-time').addEventListener('input', throttledUpdateGraph);

    // Update display for grid sliders
    const gridSliders = ['top-u', 'top-v', 'left-u', 'left-v', 'right-u', 'right-v', 'bottom-u', 'bottom-v'];
    gridSliders.forEach(slider => {
        updateSliderDisplay(slider, slider + '-value');
    });

    function updateSliderDisplay(sliderId, displayId) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        display.innerText = slider.value;
        slider.oninput = function() {
            display.innerText = this.value;
        };
    }
};
