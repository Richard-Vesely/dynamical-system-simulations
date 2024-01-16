// Function to perform Euler simulation for Gray-Scott model
function eulerSimulate(f, du, dv, k, u0, simulationTime, dt) {
    let t = 0, u = u0, v = 1 - u0;
    let us = [u0], vs = [1 - u0], ts = [0];

    while (t < simulationTime) {
        let laplacianU = 0; // Placeholder for laplacian calculation
        let laplacianV = 0; // Placeholder for laplacian calculation

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

// Create the JSXGraph board for time series
var board = JXG.JSXGraph.initBoard('box', {
    boundingbox: [-1, 2, 10, -1], axis: true
});

// Create legend for time series
board.create('text', [8, 1.8, "U concentration"], {fontSize: 18, color: '#00f'});
board.create('text', [8, 1.6, "V concentration"], {fontSize: 18, color: '#f00'});

// Create empty data series for U and V chemicals
var uSeries = board.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#00f'});
var vSeries = board.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#f00'});

// Create the JSXGraph board for phase space plot
var phaseSpaceBoard = JXG.JSXGraph.initBoard('phase-space', {
    boundingbox: [-1, 2, 2, -1], axis: true
});

// Create empty data series for phase space plot
var phaseSpaceSeries = phaseSpaceBoard.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#0a0'});

// Update function for the graph and phase space
function updateGraph() {
    const f = parseFloat(document.getElementById('f').value);
    const du = parseFloat(document.getElementById('du').value);
    const dv = parseFloat(document.getElementById('dv').value);
    const k = parseFloat(document.getElementById('k').value);
    const u0 = parseFloat(document.getElementById('u0').value);
    const simulationTime = parseFloat(document.getElementById('simulation-time').value); // New line
    const dt = 0.01;

    // Set new bounding box based on simulation time
    board.setBoundingBox([-1, 2, simulationTime, -1]);
    phaseSpaceBoard.setBoundingBox([-1, 2, 2, -1]);

    let { ts, us, vs } = eulerSimulate(f, du, dv, k, u0, simulationTime, dt);
 
    // Update U and V series
    uSeries.dataX = ts;
    uSeries.dataY = us;
    uSeries.updateDataArray();
    vSeries.dataX = ts;
    vSeries.dataY = vs;
    vSeries.updateDataArray();
    board.update(); // Update the time series board

    // Update phase space series
    phaseSpaceSeries.dataX = us;
    phaseSpaceSeries.dataY = vs;
    phaseSpaceSeries.updateDataArray();
    phaseSpaceBoard.update(); // Update the phase space board
}

// Function to update slider values
function updateSliderValues() {
    document.getElementById('f-value').innerText = document.getElementById('f').value;
    document.getElementById('du-value').innerText = document.getElementById('du').value;
    document.getElementById('dv-value').innerText = document.getElementById('dv').value;
    document.getElementById('k-value').innerText = document.getElementById('k').value;
    document.getElementById('u0-value').innerText = document.getElementById('u0').value;
    document.getElementById('simulation-time-value').innerText = document.getElementById('simulation-time').value;
}

// Throttle function to limit the rate at which updateGraph is called
let timeoutId;
function throttledUpdateGraph() {
    clearTimeout(timeoutId);
    updateSliderValues();
    timeoutId = setTimeout(updateGraph, 100); // Adjust delay as needed
}

// Initial graph and slider values update
updateGraph();
updateSliderValues();

// Attach event listeners to sliders
document.getElementById('simulation-time').addEventListener('input', throttledUpdateGraph);
document.getElementById('f').addEventListener('input', throttledUpdateGraph);
document.getElementById('du').addEventListener('input', throttledUpdateGraph);
document.getElementById('dv').addEventListener('input', throttledUpdateGraph);
document.getElementById('k').addEventListener('input', throttledUpdateGraph);
document.getElementById('u0').addEventListener('input', throttledUpdateGraph);
