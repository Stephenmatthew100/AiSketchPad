const canvas = new fabric.Canvas('canvas');
// Set up pencil brush for free drawing
const pencilBrush = new fabric.PencilBrush(canvas);
canvas.freeDrawingBrush = pencilBrush;
canvas.isDrawingMode = true; // Enable drawing mode

// Customize brush properties
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = "#000000"; // Black color for sketching
canvas.freeDrawingBrush.shadow = new fabric.Shadow({
  color: 'rgba(0, 0, 0, 0.3)',
  blur: 5,
  offsetX: 2,
  offsetY: 2
});
// Function to change brush size
function setBrushSize(size) {
    canvas.freeDrawingBrush.width = size;
  }
// Function to change brush color
function setBrushColor(color) {
    canvas.freeDrawingBrush.color = color;
  }
// Function to clear the canvas
function clearCanvas() {
    canvas.clear();
    canvas.isDrawingMode = true; // Keep drawing mode on
  }
// Switch to eraser
function setEraserMode() {
    const eraserBrush = new fabric.EraserBrush(canvas);
    canvas.freeDrawingBrush = eraserBrush;
    canvas.isDrawingMode = true;
  }
// Enable undo and redo functionality
let undoStack = [];
let redoStack = [];

canvas.on('object:added', (e) => {
  undoStack.push(e.target);
});

function undo() {
  if (undoStack.length > 0) {
    const lastObject = undoStack.pop();
    redoStack.push(lastObject);
    canvas.remove(lastObject);
  }
}

function redo() {
  if (redoStack.length > 0) {
    const lastUndoObject = redoStack.pop();
    canvas.add(lastUndoObject);
    undoStack.push(lastUndoObject);
  }
}
// Save canvas as an image
function saveCanvasAsImage() {
    const dataURL = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'sketch.png';
    link.click();
  }
// Export canvas to JSON
function exportCanvasState() {
    const json = canvas.toJSON();
    console.log(json); // Store this JSON in local storage or send to server
  }
  
  // Import canvas state from JSON
  function importCanvasState(json) {
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
    });
  }
            