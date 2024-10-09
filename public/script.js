// script.js

const socket = io(window.location.origin); // connect all clients with the same local IP address

const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');

let drawing = false;
let current = { x: 0, y: 0 };

// Array to store all strokes
let strokes = [];

// Mouse event handlers
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

// Touch event handlers for mobile support
canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

// Keyboard event handler for undo
document.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace') {
    e.preventDefault(); // Prevent default backspace behavior
    undoLastStroke();
    socket.emit('undo');
  }
});

// Socket event handlers
socket.on('drawing', onDrawingEvent);
socket.on('undo', onUndoEvent);

// Function to handle mouse down event
function onMouseDown(e) {
  drawing = true;
  current.x = (e.clientX || e.touches[0].clientX) - canvas.offsetLeft;
  current.y = (e.clientY || e.touches[0].clientY) - canvas.offsetTop;
}

// Function to handle mouse up event
function onMouseUp(e) {
  if (!drawing) return;
  drawing = false;
}

// Function to handle mouse move event
function onMouseMove(e) {
  if (!drawing) return;
  const x = (e.clientX || e.touches[0].clientX) - canvas.offsetLeft;
  const y = (e.clientY || e.touches[0].clientY) - canvas.offsetTop;

  drawLine(current.x, current.y, x, y, true, true);
  current.x = x;
  current.y = y;
}

// Function to draw a line on the canvas
function drawLine(x0, y0, x1, y1, emit, fromSelf) {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = '#000';
  context.lineWidth = 2;
  context.stroke();
  context.closePath();

  // Store the stroke
  strokes.push({ x0, y0, x1, y1, fromSelf });

  if (!emit) return;

  const w = canvas.width;
  const h = canvas.height;

  socket.emit('drawing', {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
  });
}

// Function to handle drawing event from other clients
function onDrawingEvent(data) {
  const w = canvas.width;
  const h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, false, false);
}

// Function to handle undo event from other clients
function onUndoEvent() {
  undoLastStroke(false);
}

// Function to undo the last stroke
function undoLastStroke(emit = true) {
  // Find the last stroke drawn by the current user (if emit is true)
  // or the last stroke drawn by others (if emit is false)
  for (let i = strokes.length - 1; i >= 0; i--) {
    if (strokes[i].fromSelf === emit) {
      strokes.splice(i, 1);
      break;
    }
  }

  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw all remaining strokes
  strokes.forEach((stroke) => {
    context.beginPath();
    context.moveTo(stroke.x0, stroke.y0);
    context.lineTo(stroke.x1, stroke.y1);
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
  });

  if (emit) {
    socket.emit('undo');
  }
}

// Throttle function to limit the number of events per second
function throttle(callback, delay) {
  let previousCall = new Date().getTime();
  return function () {
    const time = new Date().getTime();

    if (time - previousCall >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

// Generate QR code
const qrcodeDiv = document.getElementById('qrcode');
const localIp = '192.168.0.19'; 
const url = `http://${localIp}:3000`;
new QRCode(qrcodeDiv, {
  text: url,
  width: 128,
  height: 128,
});
