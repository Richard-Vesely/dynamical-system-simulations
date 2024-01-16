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
    const f = parseFloat(document.getElementById('f').value);
    const du = parseFloat(document.getElementById('du').value);
    const dv = parseFloat(document.getElementById('dv').value);
    const k = parseFloat(document.getElementById('k').value);
    const u0 = parseFloat(document.getElementById('u0').value);
    const simulationTime = parseFloat(document.getElementById('simulation-time').value);
    const dt = 0.01;

   // Calculate new bounding box - otherwise it id displayed in a weird way
   const minX = -simulationTime * 0.06//Math.min(0, simulationTime - 10); // Keep the last 10 units of x-axis visible
   const maxX = simulationTime;

   board.setBoundingBox([minX, 2, maxX, -1], false);

    let { ts, us, vs } = eulerSimulate(f, du, dv, k, u0, simulationTime, dt);
 
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

document.getElementById('simulation-time').addEventListener('input', throttledUpdateGraph);
document.getElementById('f').addEventListener('input', throttledUpdateGraph);
document.getElementById('du').addEventListener('input', throttledUpdateGraph);
document.getElementById('dv').addEventListener('input', throttledUpdateGraph);
document.getElementById('k').addEventListener('input', throttledUpdateGraph);
document.getElementById('u0').addEventListener('input', throttledUpdateGraph);

