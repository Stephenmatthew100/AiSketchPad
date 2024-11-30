const gridCanvas = document.getElementById('grid-canvas');
const drawingCanvas = document.getElementById('sketch-pad');
const canvasContainer = document.getElementById('canvas-container')
const gridCtx = gridCanvas.getContext('2d');
const drawingCtx = drawingCanvas.getContext('2d');
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
const penSizeInput = document.getElementById('pen-size');
const eraseButton = document.getElementById('erase');
const resetButton = document.getElementById('reset');
const drawToolButton = document.getElementById('drawTool');
const panToolButton = document.getElementById('panTool');
const customColorSwatch = document.getElementById('custom-color-swatch');
const colorDialog = document.getElementById('color-dialog');
const customColorInput = document.getElementById('custom-color');
const applyColorButton = document.getElementById('apply-color');
const closeDialogButton = document.getElementById('close-dialog');
const uploadButton = document.getElementById('zend');
const contextInput = document.getElementById('context-input');
const toggleButton = document.getElementById('toggle-controls');
const controlsBar = document.getElementById('controls-bar');
const gridSelector = document.getElementById('grid-selector');
const canvasSizeDialog = document.getElementById('canvas-size-dialog')
let isPanning = false, isPanningActive = false, isDrawing = false, color = '#ffffff', brushSize = 3, isErasing = false;
let startX, startY,  offsetX = 0, offsetY = 0, lastX, lastY

document.getElementById('set-workspace-size').addEventListener('click', () => {
    const isShown = canvasSizeDialog.style.display ==='flex';
    canvasSizeDialog.style.display = isShown ? 'none': 'flex'
});

const gridTypes = {
    'blank-grid': drawBlankGrid,
    'square-grid': drawSquareGrid,
    'notebook-grid': drawNotebookLayout,
    'dot-grid': drawDotGrid,
    'graph-paper': drawGraphPaper
};

document.querySelectorAll('.grid-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.grid-btn').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        drawGrid();
    });
});

const drawGrid = () => {
    const activeGridType = document.querySelector('.grid-btn.active')?.dataset.gridType || 'blank-grid';
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    gridTypes[activeGridType]();
};  
function drawBlankGrid() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
}
function drawSquareGrid() {
    const gridSize = 50;
    gridCtx.strokeStyle = 'green';
    gridCtx.lineWidth = 0.5;
    for (let x = 0; x < gridCanvas.width; x += gridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
    }
    for (let y = 0; y < gridCanvas.height; y += gridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }
}
function drawNotebookLayout() {
    const lineSpacing = 40, margin = 50;
    gridCtx.strokeStyle = 'green';
    gridCtx.lineWidth = 1;

    gridCtx.beginPath();
    gridCtx.moveTo(margin, 0);
    gridCtx.lineTo(margin, gridCanvas.height);
    gridCtx.stroke();

    for (let y = lineSpacing; y < gridCanvas.height; y += lineSpacing) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }
}
function drawDotGrid() {
    const dotSpacing = 40;
    gridCtx.fillStyle = 'green';
    for (let x = dotSpacing / 2; x < gridCanvas.width; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < gridCanvas.height; y += dotSpacing) {
            gridCtx.beginPath();
            gridCtx.arc(x, y, 1, 0, Math.PI * 2);
            gridCtx.fill();
        }
    }
}
function drawGraphPaper() {
    const majorGridSize = 100, minorGridSize = 20;

    gridCtx.strokeStyle = '#000';
    gridCtx.lineWidth = 1;
    for (let x = 0; x < gridCanvas.width; x += majorGridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
    }
    for (let y = 0; y < gridCanvas.height; y += majorGridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }

    gridCtx.strokeStyle = '#aaa';
    gridCtx.lineWidth = 0.5;
    for (let x = 0; x < gridCanvas.width; x += minorGridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
    }
    for (let y = 0; y < gridCanvas.height; y += minorGridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }
}

const resizeCanvases = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight - 80;
    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;
    drawingCanvas.width = canvasWidth;
    drawingCanvas.height = canvasHeight;
    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;
    drawGrid();
};window.addEventListener('resize', resizeCanvases); resizeCanvases();

eraseButton.addEventListener('click', () => {
    isErasing = true;
    isPanning = false;
    isDrawing = false;
    drawingCanvas.style.cursor = 'grab';
});
drawToolButton.addEventListener('click', () => {
    isErasing = false;
    isPanning = false;
    drawingCanvas.style.cursor = 'crosshair';

});
panToolButton.addEventListener('click', () => {
    isErasing = false;
    isPanning = true;
    drawingCanvas.style.cursor = 'all-scroll';

});
resetButton.addEventListener('click', () => {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // Clear only drawing canvas
});

drawingCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    if (isErasing) {
        drawingCtx.clearRect(e.offsetX - brushSize / 2, e.offsetY - brushSize / 2, brushSize, brushSize);
        return;
    } else {
        drawingCtx.strokeStyle = color;
    }

    drawingCtx.lineWidth = brushSize;
    drawingCtx.lineCap = 'round';
    drawingCtx.beginPath();
    drawingCtx.moveTo(lastX, lastY);
    drawingCtx.lineTo(e.offsetX + offsetX, e.offsetY + offsetY);
    drawingCtx.stroke();

    [lastX, lastY] = [e.offsetX + offsetX, e.offsetY + offsetY];

});
drawingCanvas.addEventListener('mousedown', (e) => {
    if (isPanning) return;
    isDrawing = true;
    [lastX, lastY] = [e.offsetX + offsetX, e.offsetY + offsetY];
});
drawingCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
    drawingCtx.beginPath();
});
drawingCanvas.addEventListener('mouseout', () => {
    isDrawing = false;
    drawingCtx.beginPath();
});
canvasContainer.addEventListener('mousedown', (e) => {
    if (isPanning) {
        isPanningActive = true;
        startX = e.pageX;
        startY = e.pageY;
    }
});
canvasContainer.addEventListener('mouseleave', () => {
    isPanningActive = false;
});
canvasContainer.addEventListener('mouseup', () => {
    isPanningActive = false;
});
canvasContainer.addEventListener('mousemove', (e) => {
    if (!isPanningActive) return;
    e.preventDefault();
    const x = e.pageX;
    const y = e.pageY;
    const walkX = (x - startX);
    const walkY = (y - startY);
    offsetX -= walkX;
    offsetY -= walkY;
    startX = x;
    startY = y;
    canvasContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
});

drawingCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    lastX = touch.clientX - drawingCanvas.getBoundingClientRect().left;
    lastY = touch.clientY - drawingCanvas.getBoundingClientRect().top;
    isDrawing = true;
}, { passive: false });

drawingCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    if (!isDrawing) return;

    const touch = e.touches[0];
    const currentX = touch.clientX - drawingCanvas.getBoundingClientRect().left;
    const currentY = touch.clientY - drawingCanvas.getBoundingClientRect().top;

    drawingCtx.strokeStyle = color;
    drawingCtx.lineWidth = brushSize;
    drawingCtx.lineCap = 'round';
    drawingCtx.beginPath();
    drawingCtx.moveTo(lastX, lastY);
    drawingCtx.lineTo(currentX, currentY);
    drawingCtx.stroke();

    lastX = currentX;
    lastY = currentY;
}, { passive: false });

drawingCanvas.addEventListener('touchend', () => {
    isDrawing = false;
    drawingCtx.beginPath();
});



penSizeInput.addEventListener('input', (event) => {
    brushSize = event.target.value;
    document.getElementById('pen-px').textContent = brushSize;
});

document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        color = e.target.style.backgroundColor;
        customColorSwatch.style.backgroundColor = color;
        isErasing = false;
    });
});
customColorSwatch.addEventListener('click', () => {
    colorDialog.style.display = 'block';
});
applyColorButton.addEventListener('click', () => {
    color = customColorInput.value;
    customColorSwatch.style.backgroundColor = color;
    colorDialog.style.display = 'none';
});
closeDialogButton.addEventListener('click', () => {
    colorDialog.style.display = 'none';
});

const resultContainer = document.getElementById('results-container')
document.getElementById('results-header').addEventListener('click', () => {
    const resultBoxes = document.getElementById('result-boxes');
    resultBoxes.classList.toggle('collapsed');
    resultContainer.style.backgroundColor = resultContainer.style.backgroundColor === 'transparent' ? 'black' : 'transparent';
});


function displayBackendResponse(response) {
    const resultBoxContainer = document.getElementById('result-boxes');
    resultContainer.style.display = 'block';
    resultBoxContainer.innerHTML = '';
    const data = Array.isArray(response.data) ? response.data : [response.data];

    data.forEach(item => {
        const resultBox = document.createElement('div');
        resultBox.className = 'result-box';

        const expr = item.expr || 'No Expression';
        const result = item.result || 'No result';
        const explanation = item.explanation || 'No further explanation';
        
        resultBox.innerHTML = `
            <strong>${expr}</strong><br>
            <span>Result: ${result}</span>
            <div class="explanation" style="display: none;">${explanation}</div>
            <canvas id="graph-canvas-${item.id}" width="400" height="200"></canvas>
        `;

        resultBox.addEventListener('click', () => {
            const explanationDiv = resultBox.querySelector('.explanation');
            explanationDiv.style.display = explanationDiv.style.display === 'none' ? 'block' : 'none';
            resultBox.style.backgroundColor = resultBox.style.backgroundColor === 'transparent' ? 'black' : 'transparent';
        });

        resultBoxContainer.appendChild(resultBox);

        // Check if graph data exists and draw the graph
        if (item.graph) {
            drawGraph(item.graph, `graph-canvas-${item.id}`);
        }
    });
}

const drawGraph = (graphData, canvasId) => {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Clear any previous charts
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    const { type, data, equation } = graphData;

    // Prepare data for Chart.js
    const chartData = {
        datasets: [{
            label: equation || 'Graph',
            data: data.map(point => ({ x: point.x, y: point.y })),
            borderColor: 'blue',
            fill: false,
        }]
    };

    const config = {
        type: type,
        data: chartData,
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'X-axis',
                    },
                    type: 'linear',
                },
                y: {
                    title: {
                        display: true,
                        text: 'Y-axis',
                    },
                },
            },
        },
    };

    // Create the chart
    ctx.chart = new Chart(ctx, config);
};

stat = (window.navigator.onLine ? 'on': 'off'+ 'line')
const sendImageToBackend = async () => {
    setProcessingState(true)
    const imageData = drawingCanvas.toDataURL('image/png');
    const data = {
        image: imageData,
        dict_of_vars: { context: contextInput.value }
    };
    try {
        const response = await fetch('/upload/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        console.log('Data Sent',data)
        const result = await response.json();
        displayBackendResponse(result); // Pass the whole response object
        console.log('Backend response:', result);
    } catch (error) {
        console.error('Error:', error);
        console.log('Something Came up', 'error')
    } finally {
        setProcessingState(false)
    }
};uploadButton.addEventListener('click', function(){
    if (stat === 'offline'){
        showMessage('Err... You are Offline', 'warning')
    }else{sendImageToBackend()}

});

controlsBar.classList.toggle('expanded');

document.getElementById('set-workspace-size').addEventListener('click', () => {
    const isExpanded = gridSelector.style.display === 'flex';
    gridSelector.style.display = isExpanded ? 'none' : 'flex';
});

function createMessage(message, messageType){
    const messageh3 = document.createElement('h3');
    messageh3.textContent = messageType;
    messageh3.className = `messageh3 ${messageType}`;

    const messagep = document.createElement('p');
    messagep.textContent = message;
    messagep.className = 'messagep'

    const messages = document.createElement('div');
    messages.className = 'messages';

    // messages.appendChild(statusbox);
    // console.log(messages.parentNode)
    messages.appendChild(messageh3);
    messages.appendChild(messagep);
    return messages;
}

function showMessage(message, messageType, persist = false){
    const messageBox = document.getElementById('message-box');
    const statusbox = document.createElement('span');
    statusbox.className = `status-box ${messageType}`;

    const toast = createMessage(message, messageType);
    
    messageBox.appendChild(statusbox)
    messageBox.appendChild(toast)
    if (!persist){
        setTimeout(() =>{
            messageBox.innerHTML = '';
        }, 3000);
    }
}

function setProcessingState(isProcessing) {
    const body = document.body;
    if (isProcessing) {
        body.style.cursor = 'wait';
        uploadButton.disabled = true;
        showMessage('Processing....', 'info', true); 
    } else {
        body.style.cursor = 'default';
        uploadButton.disabled = false
        const messageBox = document.getElementById('message-box');
        messageBox.innerHTML = '';
    }
}

// follow up
document.getElementById('sendButton').addEventListener('click', async function() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();

    // Check if the input is not empty
    if (messageText) {
        // Send the follow-up question to the backend with the previous response context
        const imageData = drawingCanvas.toDataURL('image/png');
        const data = {
            image: imageData,
            context: resultContainer.innerText,
            question: messageText,
        }
        console.log(data)

        try {
            const response = await fetch('/ask_follow_up/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            displayFollowUpResponse(result);
            messageInput.value = '';  // Clear the input field after sending
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error while processing your follow-up question', 'error');
        }
    }
});

function displayFollowUpResponse(response) {
    // Here you would display the follow-up answer below the existing results
    const resultBoxContainer = document.getElementById('result-boxes');
    const followUpBox = document.createElement('div');
    followUpBox.className = 'result-box follow-up';
    
    followUpBox.innerHTML = `
        <strong>Follow-up Answer:</strong>
        <p>${response.answer}</p>
    `;
    
    resultBoxContainer.appendChild(followUpBox);
}
