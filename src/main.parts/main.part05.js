> {
  input.addEventListener('input', updateCutFields);
  input.addEventListener('change', updateCutFields);
});
ui.applyCut.addEventListener('click', (event) => {
  event.preventDefault();
  applyCut();
});
document.querySelector('#reset-cut').addEventListener('click', () => {
  clearCutPlacement();
  setStatus('Sottrai: clicca il punto in cui piazzare la figura di taglio.');
});
ui.applySketch.addEventListener('click', (event) => {
  event.preventDefault();
  applySketch();
});
document.querySelector('#reset-sketch').addEventListener('click', () => {
  clearSketch();
  setStatus('Linea: clicca il primo punto della sagoma.');
});
ui.holeDiameter.addEventListener('input', drawHoleCreatePreview);
ui.holeDepth.addEventListener('input', drawHoleCreatePreview);
ui.applyHole.addEventListener('click', (event) => {
  event.preventDefault();
  applyHole();
});
document.querySelector('#reset-hole').addEventListener('click', () => {
  clearHoleCreate();
  setStatus('Clicca una superficie per impostare il centro del foro.');
});
ui.pushPullForm.addEventListener('submit', (event) => {
  event.preventDefault();
  applyPushPull(parseDecimal(document.querySelector('#pushpull-distance').value, 0));
});
ui.undo.addEventListener('click', () => restoreFrom(undoStack, redoStack));
ui.redo.addEventListener('click', () => restoreFrom(redoStack, undoStack));

canvas.addEventListener('pointerdown', (event) => {
  pointerDown = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener('pointerup', (event) => {
  if (!pointerDown) return;
  const movement = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  pointerDown = null;
  if (movement < 4 && event.button === 0 && !['orbit', 'pan'].includes(activeTool)) {
    if (activeTool === 'measure') measureAt(event.clientX, event.clientY);
    else if (activeTool === 'movehole') moveHoleAt(event.clientX, event.clientY);
    else if (activeTool === 'hole') holeAt(event.clientX, event.clientY);
    else if (activeTool === 'box') boxAt(event.clientX, event.clientY);
    else if (activeTool === 'cylinder') cylinderAt(event.clientX, event.clientY);
    else if (activeTool === 'cut') cutAt(event.clientX, event.clientY);
    else if (activeTool === 'line') sketchAt(event.clientX, event.clientY);
    else selectAt(event.clientX, event.clientY);
  }
});
canvas.addEventListener('pointermove', (event) => {
  previewMeasurement(event.clientX, event.clientY);
  previewSketch(event.clientX, event.clientY);
});
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

window.addEventListener('keydown', (event) => {
  if (event.target.matches('input')) return;
  if (event.ctrlKey && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    restoreFrom(undoStack, redoStack);
    return;
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'y') {
    event.preventDefault();
    restoreFrom(redoStack, undoStack);
    return;
  }
  const shortcuts = {
    ' ': 'select',
    p: 'pushpull',
    h: 'hole',
    f: 'movehole',
    b: 'box',
    c: 'cylinder',
    t: 'cut',
    l: 'line',
    m: 'measure',
    o: 'orbit',
  };
  const tool = shortcuts[event.key.toLowerCase()];
  if (tool) {
    event.preventDefault();
    setTool(tool);
  }
  if (event.key === 'Escape') {
    if (activeTool === 'measure' && measurementStart && !measurementEnd) {
      clearMeasurement();
      setStatus('Misura annullata.');
    } else {
      setTool('select');
    }
  }
});

new ResizeObserver(resize).observe(viewport);
createExample();
updateInspector();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
