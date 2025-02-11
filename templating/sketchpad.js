document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('sketch-pad');
    const gridCanvas = document.getElementById('grid-canvas');
    const gridCtx = gridCanvas.getContext('2d');
    const coordXElem = document.getElementById('coord-x');
    const coordYElem = document.getElementById('coord-y');
    const contextMenu = document.getElementById('context-menu');
    const sendButton = document.getElementById('sendButton')
    let appState = {
        currentTool: 'draw',  // Initially set to 'draw'
        currentColor: 'white',
        currentPenSize: 3,
        eraserRadius: 20,
        lastX: 0,
        lastY: 0,
    };
    let selectedObject = null;
    toggleTool('draw');  // Default tool is 'draw'

    // Resize the canvas on window resize
    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        gridCanvas.width = window.innerWidth;
        gridCanvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
 
    // Switch to drawing tool
    document.getElementById('drawTool').addEventListener('click', function() {
        // Toggle between 'draw' and 'select'
        if (appState.currentTool === 'draw') {
            toggleTool('select');
        } else {
            toggleTool('draw');
        }
    });

    // Function to toggle between drawing and selection tools
    function toggleTool(tool) {
        if (tool === 'draw') {
            appState.currentTool = 'draw';
            canvas.isDrawingMode = true;  // Enable drawing mode
            canvas.selection = true;  // Enable object selection during drawing
            
            // Set up the drawing brush (pencil tool)
            const pencilBrush = new fabric.PencilBrush(canvas);
            pencilBrush.color = appState.currentColor;  // Use the current pen color
            pencilBrush.width = appState.currentPenSize;  // Use the current pen size
            canvas.freeDrawingBrush = pencilBrush;  // Set the brush to the pencil brush

            // Change tool icon to pencil
            document.getElementById('drawTool').querySelector('img').src = '../static/img/pen.svg'; 
        } else if (tool === 'select') {
            appState.currentTool = 'select';
            canvas.selection = true; // Enable selection mode
            canvas.isDrawingMode = false;  // Disable drawing mode
            
            // Change tool icon to select
            document.getElementById('drawTool').querySelector('img').src = '../static/img/select.svg'; 

            // When the selection tool is active, users can click and drag objects
            canvas.on('mouse:down', function(event) {
                const pointer = canvas.getPointer(event.e);
                const target = canvas.findTarget(event.e);
                
                if (target) {
                    canvas.setActiveObject(target);
                }
            });
        }
    }

    // Handle mouse down events (start drawing)
    canvas.on('mouse:down', function(event) {
        const pointer = canvas.getPointer(event.e);  // Get pointer position
    });

    // Handle mouse move events (draw)
    canvas.on('mouse:move', function(event) {
        const pointer = canvas.getPointer(event.e);  // Get the pointer position
        coordXElem.textContent = pointer.x.toFixed(0);  // Update X coordinate
        coordYElem.textContent = pointer.y.toFixed(0);  // Update Y coordinate
    });

    // Handle mouse up events (stop drawing)
    canvas.on('mouse:up', function() {
        // Handle stop of drawing or other actions here
    });

    // Reset the canvas
    document.getElementById('reset').addEventListener('click', function() {
        canvas.clear();
    });

    const colorPickerInput = document.createElement('input');
    colorPickerInput.type = 'color';
    colorPickerInput.style.display = 'none';
    document.body.appendChild(colorPickerInput);

    // Handle predefined color selection
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            appState.currentColor = this.style.backgroundColor || this.querySelector('img')?.style.backgroundColor;
            // Update the drawing color
            if (canvas.isDrawingMode) {
                canvas.freeDrawingBrush.color = appState.currentColor;
            }
        });
    });

    // Open the color picker when clicking the custom color swatch
    document.getElementById('custom-color-swatch').addEventListener('click', function() {
        colorPickerInput.click(); 
    });

    // Update the color when the color picker value changes
    colorPickerInput.addEventListener('input', function() {
        appState.currentColor = colorPickerInput.value;
        document.getElementById('custom-color-swatch').style.backgroundColor = colorPickerInput.value
        if (canvas.isDrawingMode) {
            canvas.freeDrawingBrush.color = appState.currentColor;
        }
    });


    // Pen size control
    document.getElementById('pen-size').addEventListener('input', function(e) {
        appState.currentPenSize = e.target.value;
        canvas.freeDrawingBrush.width = appState.currentPenSize;
    });

    // Draw a simple grid (optional)
    function drawGrid() {
        gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        gridCtx.beginPath();
        const step = 50;
        for (let x = 0; x < gridCanvas.width; x += step) {
            gridCtx.moveTo(x, 0);
            gridCtx.lineTo(x, gridCanvas.height);
        }
        for (let y = 0; y < gridCanvas.height; y += step) {
            gridCtx.moveTo(0, y);
            gridCtx.lineTo(gridCanvas.width, y);
        }
        gridCtx.stroke();
    }

    drawGrid();

    // right-click context menu
    window.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (e.target === canvas.upperCanvasEl) {
            const pointer = canvas.getPointer(e);
            const target = canvas.findTarget(e);
            
            if (target) {
                canvas.setActiveObject(target);
                contextMenu.style.left = `${pointer.x}px`;
                contextMenu.style.top = `${pointer.y}px`;
                contextMenu.style.display = 'block';
            }
        }
    });
    function toggleContextMenuButtons(isEnabled) {
        const buttons = contextMenu.querySelectorAll('button');
        buttons.forEach(button => {
            if (isEnabled) {
                button.classList.remove('disabled');
                button.disabled = false;
            } else {
                button.classList.add('disabled');
                button.disabled = true;
            }
        });
    }
    window.addEventListener('contextmenu', function(e) {
        e.preventDefault();

        const pointer = canvas.getPointer(e);
        const target = canvas.findTarget(e);  // Get the object clicked on

        if (target) {
            // Object is selected
            selectedObject = target;
            canvas.setActiveObject(target);  // Set as active object
            toggleContextMenuButtons(true);  // Enable all buttons
        } else {
            // No object is selected
            selectedObject = null;
            toggleContextMenuButtons(false);  // Disable object-related buttons
        }

        // Position the context menu at the mouse location
        contextMenu.style.left = `${pointer.x}px`;
        contextMenu.style.top = `${pointer.y}px`;

        // Display the context menu
        contextMenu.style.display = 'block';    
    });

    document.addEventListener('mousedown', function(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });
    
    // Duplicate an object in the context menu
    document.getElementById('duplicate').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            const clone = fabric.util.object.clone(activeObject);
            clone.left += 20;
            clone.top += 20;
            canvas.add(clone);
            canvas.setActiveObject(clone);
        }
        contextMenu.style.display = 'none';
    });

    // Delete an object from the canvas
    document.getElementById('delete').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
        }
        contextMenu.style.display = 'none';
    });

    // Send an object to the back
    document.getElementById('send-to-back').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.sendToBack();
        }
        contextMenu.style.display = 'none';
    });

    // Bring an object to the front
    document.getElementById('bring-to-front').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.bringToFront();
        }
        contextMenu.style.display = 'none';
    });

    // Lock the selected object
    document.getElementById('lock-object').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.lockMovementX = true;
            activeObject.lockMovementY = true;
            activeObject.lockScalingX = true;
            activeObject.lockScalingY = true;
            activeObject.lockRotation = true;
        }
        contextMenu.style.display = 'none';
    });

    // View object properties (optional, log in console for now)
    document.getElementById('object-properties').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            console.log(activeObject);
        }
        contextMenu.style.display = 'none';
    });
    

    function getBoundingBoxOfSelectedObjects() {
        const selectedObjects = canvas.getActiveObjects();
        
        if (selectedObjects.length === 0) {
            console.log("No objects selected.");
            return null;
        }
        
        let boundingBox = selectedObjects[0].getBoundingRect();
        
        const bb = {
            left: boundingBox.left,
            top: boundingBox.top,
            width: boundingBox.width,
            height: boundingBox.height,
        }
        console.log(bb)
        return bb
    };

    function displayResultBox(resultData, boundingBox) {
        const resultBox = document.createElement('div');
        resultBox.classList.add('result-box');
        
        // Positioning the result box below the bounding box (add some margin if needed)
        const margin = 10;
        const resultBoxWidth = 200;
        const resultBoxLeft = boundingBox.left;  // We can position it under the bounding box from the left
        const resultBoxTop = boundingBox.top + boundingBox.height + margin;  // Position it below the bounding box
    
        resultBox.style.position = 'absolute';
        resultBox.style.left = `${resultBoxLeft}px`;
        resultBox.style.top = `${resultBoxTop}px`;
        resultBox.style.width = `${resultBoxWidth}px`;
        resultBox.style.border = '1px solid #ccc';
        resultBox.style.padding = '10px';
        resultBox.style.backgroundColor = 'rgb(36, 33, 33)';
        resultBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        resultBox.style.zIndex = '10';
        resultBox.style.display = 'none';  // Initially hidden
        
        // Optional: Add custom CSS properties for hover effects later
        resultBox.style.setProperty('--bounding-left', `${ resultBoxLeft}px`);
        resultBox.style.setProperty('--bounding-top', `${resultBoxTop}px`);
        resultBox.style.setProperty('--bounding-width', `${boundingBox.width}px`);
        resultBox.style.setProperty('--bounding-height', `${boundingBox.height}px`);
    
        // Collapsible content inside the result box
        const collapsibleContent = document.createElement('div');
        collapsibleContent.classList.add('collapsible-content');
        collapsibleContent.innerHTML = `
            <p><strong>Expression:</strong> ${resultData.expr}</p>
            <p><strong>Explanation:</strong> ${resultData.explanation}</p>
            <p><strong>Result:</strong> ${resultData.result}</p>
        `;
    
        closed_svg = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 96.44"><title>open-book</title><path d="M12,73.51q.2-34.74.39-69.38A3.21,3.21,0,0,1,15,1h0C23.4-.75,36.64-.31,45.63,3.14a35.46,35.46,0,0,1,16,11.65,37.34,37.34,0,0,1,16-11.15C86.12.4,99-.38,108.23,1A3.2,3.2,0,0,1,111,4.14h0V73.8A3.21,3.21,0,0,1,107.77,77a3.49,3.49,0,0,1-.74-.09A53.45,53.45,0,0,0,83.58,79.1a71,71,0,0,0-15.77,8.26,69.09,69.09,0,0,1,21.24-3.1,125.42,125.42,0,0,1,27.41,3.48V14.84h3.21a3.21,3.21,0,0,1,3.21,3.21V91.94a3.21,3.21,0,0,1-3.21,3.21,3.18,3.18,0,0,1-1-.17A121.77,121.77,0,0,0,89,90.65a61.89,61.89,0,0,0-25.76,5.26,3.39,3.39,0,0,1-3.64,0,61.86,61.86,0,0,0-25.76-5.26A121.77,121.77,0,0,0,4.24,95a3.18,3.18,0,0,1-1,.17A3.21,3.21,0,0,1,0,91.94V18.05a3.21,3.21,0,0,1,3.21-3.21H6.42v72.9a125.42,125.42,0,0,1,27.41-3.48,68.84,68.84,0,0,1,22.71,3.57A48.7,48.7,0,0,0,41,79.39c-7-2.3-17.68-3.07-25.49-2.4A3.21,3.21,0,0,1,12,74.06a5,5,0,0,1,0-.55ZM73.64,64.4a2.3,2.3,0,1,1-2.5-3.85,51.46,51.46,0,0,1,11.8-5.4,53.73,53.73,0,0,1,13-2.67,2.29,2.29,0,1,1,.25,4.58,49.42,49.42,0,0,0-11.79,2.46A46.73,46.73,0,0,0,73.64,64.4Zm.2-17.76a2.29,2.29,0,0,1-2.46-3.87,52.71,52.71,0,0,1,11.74-5.3A54.12,54.12,0,0,1,95.9,34.85a2.3,2.3,0,0,1,.25,4.59,49.3,49.3,0,0,0-11.63,2.4,48,48,0,0,0-10.68,4.8Zm.06-17.7a2.3,2.3,0,1,1-2.46-3.89,52.54,52.54,0,0,1,11.72-5.27,53.71,53.71,0,0,1,12.74-2.6,2.29,2.29,0,1,1,.25,4.58,49.35,49.35,0,0,0-11.59,2.39A47.91,47.91,0,0,0,73.9,28.94ZM51.74,60.55a2.3,2.3,0,1,1-2.5,3.85,46.73,46.73,0,0,0-10.72-4.88,49.42,49.42,0,0,0-11.79-2.46A2.29,2.29,0,1,1,27,52.48a53.73,53.73,0,0,1,13,2.67,51.46,51.46,0,0,1,11.8,5.4ZM51.5,42.77A2.29,2.29,0,0,1,49,46.64a48,48,0,0,0-10.68-4.8,49.3,49.3,0,0,0-11.63-2.4A2.3,2.3,0,0,1,27,34.85a54.12,54.12,0,0,1,12.78,2.62,52.71,52.71,0,0,1,11.74,5.3Zm-.06-17.72A2.3,2.3,0,1,1,49,28.94a47.91,47.91,0,0,0-10.66-4.79,49.35,49.35,0,0,0-11.59-2.39A2.29,2.29,0,1,1,27,17.18a53.71,53.71,0,0,1,12.74,2.6,52.54,52.54,0,0,1,11.72,5.27ZM104.56,7c-7.42-.7-18.06.12-24.73,2.65A30,30,0,0,0,64.7,21.46V81.72a76.76,76.76,0,0,1,16.72-8.66,62.85,62.85,0,0,1,23.14-2.87V7ZM58.28,81.1V21.37c-3.36-5.93-8.79-9.89-14.93-12.24-7-2.67-17.75-3.27-24.56-2.3l-.36,63.56c7.43-.27,17.69.68,24.52,2.91a54.94,54.94,0,0,1,15.33,7.8Z"/></svg>`
        opened_svg = `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"viewBox="0 0 427 511.85"><path fill="black" fill-rule="nonzero" d="M57.35 493.94l349.22 0c1.41,0 2.52,-1.1 2.52,-2.52l0 -66.84 -351.74 0c-16.85,0 -27.56,8.86 -32.18,20.19 -1.86,4.54 -2.79,9.51 -2.79,14.5 0,19.75 14.34,34.67 34.97,34.67zm-15.76 -20.96l353.91 0 0 7.85 -350.17 0c-1.51,-2.46 -2.77,-5.09 -3.74,-7.85zm3.74 -35.3c-1.5,2.46 -2.76,5.09 -3.74,7.85l353.91 0 0 -7.85 -350.17 0zm-5.92 17.65c-0.25,2.62 -0.25,5.23 0,7.85l356.09 0 0 -7.85 -356.09 0zm381.57 50.51c-3.72,3.71 -8.83,6.01 -14.41,6.01l-349.22 0c-40.09,0 -57.35,-35.04 -57.35,-70.32l0 -362.31c0,-21.59 8.69,-40.71 22.76,-54.78 14.27,-14.27 34.12,-23.31 56.04,-24.4l11.99 0c0.26,-0.02 0.52,-0.04 0.78,-0.04 0.26,0 0.53,0.02 0.78,0.04l324.32 -0.04c4.95,0 8.96,4.01 8.96,8.96l0 406.95c0.88,1.94 1.37,4.09 1.37,6.34l0 69.17c0,5.58 -2.29,10.67 -5.98,14.38l-0.04 0.04zm-13.26 -99.18l0 -388.75 -307.19 0 0 388.75 307.19 0zm-325.11 0l0 -388.75 -3.39 0c-17.15,0.95 -32.65,8.05 -43.8,19.19 -10.82,10.82 -17.51,25.53 -17.51,42.12l0 343.82c8.84,-9.83 22,-16.38 39.44,-16.38l25.26 0z"/></svg>`
        
        // Button to show/hide the content
        const collapsibleButton = document.createElement('button');
        collapsibleButton.innerHTML = opened_svg;
        collapsibleButton.onclick = function() {
            const isVisible = collapsibleContent.style.display !== 'none';
            collapsibleContent.style.display = isVisible ? 'none' : 'block';
            collapsibleButton.innerHTML = isVisible ? opened_svg : closed_svg;
        };
    
        resultBox.appendChild(collapsibleButton);
        resultBox.appendChild(collapsibleContent);
    
        // Append the result box to the body or any other container
        document.body.appendChild(resultBox);
    
        // Show the result box with a fade-in effect
        setTimeout(() => {
            resultBox.style.display = 'block';
        }, 100);
    }    
    
    sendButton.addEventListener('click', function() {
        const message = document.getElementById('messageInput').value;
        contextMenu.style.display = 'none';
    
        const selectedObjects = canvas.getActiveObjects();
    
        if (selectedObjects.length === 0) {
            console.log("No objects selected.");
            return;
        }
        // Get the bounding box of the selected objects
        const boundingBox = getBoundingBoxOfSelectedObjects();
        // displayResultBox(data, boundingBox);   
    
        //   Create a base64 image from the selected objects
        const base64Image = canvas.toDataURL({ format: 'png' });
    
        // Send the base64 image and context to the backend
        fetch('http://localhost:8000/process_image/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                dict_of_vars: { context: message }
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('AI Response:', data);
            
            // Get the bounding box of the selected objects
            const boundingBox = selectedObject.getBoundingRect();
            // const boundingBox = getBoundingBoxOfSelectedObjects();
            
            // console.log(selectedObject.getBoundingRect())
            if (boundingBox) {
                // Dynamically create and display the result box
                displayResultBox(data, boundingBox);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    
});

