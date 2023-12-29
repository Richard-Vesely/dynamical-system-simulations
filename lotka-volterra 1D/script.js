// Function to perform Euler simulation
function eulerSimulate(a, b, c, d, x0, y0, simulationTime, dt) {
    let t = 0, x = x0, y = y0;
    let xs = [x0], ys = [y0], ts = [0];

    while (t < simulationTime) {
        let dx = dt * (a * x - b * x * y);
        let dy = dt * (c * x * y - d * y);
        x += dx;
        y += dy;
        t += dt;
        xs.push(x);
        ys.push(y);
        ts.push(t);
    }

    return { ts, xs, ys };
}

// Create the JSXGraph board for time series
var board = JXG.JSXGraph.initBoard('box', {
    boundingbox: [-1, 10, 10, -1], axis: true
});
// Create legend
board.create('text', [8, 9, "Prey"], {fontSize: 18, color: '#00f'});
board.create('text', [8, 8.5, "Predator"], {fontSize: 18, color: '#f00'});

// Create empty data series for prey and predator
var preySeries = board.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#00f'});
var predatorSeries = board.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#f00'});

// Create the JSXGraph board for phase space plot
var phaseSpaceBoard = JXG.JSXGraph.initBoard('phase-space', {
    boundingbox: [-1, 10, 10, -1], axis: true
});

// Create empty data series for phase space plot
var phaseSpaceSeries = phaseSpaceBoard.create('curve', [[], []], {strokeWidth: 2, strokeColor: '#0a0'});

// Update function for the graph and phase space
function updateGraph() {
    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('b').value);
    const c = parseFloat(document.getElementById('c').value);
    const d = parseFloat(document.getElementById('d').value);
    const x0 = parseFloat(document.getElementById('x0').value);
    const y0 = parseFloat(document.getElementById('y0').value);
    const simulationTime = 10;
    const dt = 0.0001;

    let { ts, xs, ys } = eulerSimulate(a, b, c, d, x0, y0, simulationTime, dt);

    // Update prey and predator series
    preySeries.dataX = ts;
    preySeries.dataY = xs;
    preySeries.updateDataArray();
    predatorSeries.dataX = ts;
    predatorSeries.dataY = ys;
    predatorSeries.updateDataArray();
    board.update(); // Update the time series board

    // Update phase space series
    phaseSpaceSeries.dataX = xs;
    phaseSpaceSeries.dataY = ys;
    phaseSpaceSeries.updateDataArray();
    phaseSpaceBoard.update(); // Update the phase space board
}

// Throttle function to limit the rate at which updateGraph is called
let timeoutId;
function throttledUpdateGraph() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(updateGraph, 100); // Adjust delay as needed
}

// Initial graph update
updateGraph();

// Attach event listeners to sliders
document.getElementById('a').addEventListener('input', throttledUpdateGraph);
document.getElementById('b').addEventListener('input', throttledUpdateGraph);
document.getElementById('c').addEventListener('input', throttledUpdateGraph);
document.getElementById('d').addEventListener('input', throttledUpdateGraph);
document.getElementById('x0').addEventListener('input', throttledUpdateGraph);
document.getElementById('y0').addEventListener('input', throttledUpdateGraph);
