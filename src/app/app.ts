const MAX_SPACE = 262143;
const FRAME_SIZE = 262;
const DEFAULT_CORNERS = [-131071, -131071, 131071, 131071];

let corners = DEFAULT_CORNERS;
let biggerCorner = MAX_SPACE;
let scale = 0;
let isRelativeScale = false;

function uiMessageHandler(message) {
  console.log('Message from UI:', message);
  const { type, data } = message;
  if (type === 'CHANGE_RELATIVE_SCALE') {
    const { value } = data;
    setIsRelativeScale(value);
    updateMap();
  }
}

function calcScale(currentCorner) {
  return FRAME_SIZE / currentCorner;
}

function setScale(currentCorner) {
  scale = calcScale(currentCorner);
  return scale;
}

function setIsRelativeScale(value) {
  isRelativeScale = value || false;
}

function getNodes() {
  return figma.currentPage.children;
}

function setMapCorners(nodes) {
  if (!isRelativeScale) {
    corners = DEFAULT_CORNERS;
    biggerCorner = MAX_SPACE;
    return;
  }

  let [x1, y1, x2, y2] = [0, 0, 0, 0];

  nodes.forEach((node) => {
    const { x, y, width, height } = node;
    const xx = x + width;
    const yy = y + height;

    const [xStart, xEnd] = x < xx ? [x, xx] : [xx, x];
    const [yStart, yEnd] = y < yy ? [y, yy] : [yy, y];

    if (xStart < x1) x1 = xStart;
    if (xEnd > x2) x2 = xEnd;
    if (yStart < y1) y1 = yStart;
    if (yEnd > y2) y2 = yEnd;
  });

  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  corners = [x1, y1, x2, y2];
  biggerCorner = width > height ? width : height;
}

function getShift(x, y) {
  const [x0, y0, x1, y1] = corners;

  const centeredX = (biggerCorner - (x1 - x0)) / 2;
  const centeredY = (biggerCorner - (y1 - y0)) / 2;

  const shiftedX = isRelativeScale ? x - x0 + centeredX : x + MAX_SPACE / 2;
  const shiftedY = isRelativeScale ? y - y0 + centeredY : y + MAX_SPACE / 2;

  return [shiftedX, shiftedY];
}

function calcNodesPreview(nodes) {
  const calcNodes = {};
  nodes.forEach((node) => {
    const { id, x, y, width, height } = node;

    const [shiftX, shiftY] = getShift(x, y);

    calcNodes[id] = {
      x: Math.ceil(shiftX * scale),
      y: Math.ceil(shiftY * scale),
      width: Math.round(width * scale) || 1,
      height: Math.round(height * scale) || 1,
    };
  });

  return calcNodes;
}

function updateMap() {
  const nodes = getNodes();
  setMapCorners(nodes);
  setScale(biggerCorner);
  const nodesPreview = calcNodesPreview(nodes);
  figma.ui.postMessage({ type: 'updateMap', data: nodesPreview });
}

figma.showUI(__html__, {
  width: 262,
  height: 262,
});

function updateSelectionView() {
  const { x, y, width, height } = figma.viewport.bounds;
  const [shiftX, shiftY] = getShift(x, y);
  const data = {
    left: Math.ceil(shiftX * scale),
    top: Math.ceil(shiftY * scale),
    width: Math.round(width * scale) || 1,
    height: Math.round(height * scale) || 1,
  };
  figma.ui.postMessage({ type: 'updateSelectionView', data });
}

figma.on('currentpagechange', updateMap);

figma.loadAllPagesAsync().then(() => {
  figma.on('documentchange', (event) => {
    const hasGeometryChange = event.documentChanges.find((change) => {
      return (
        change.type === 'CREATE' ||
        change.type === 'DELETE' ||
        (change.type === 'PROPERTY_CHANGE' &&
          change.properties.some((prop) => ['x', 'y', 'width', 'height'].includes(prop)))
      );
    });
    if (hasGeometryChange) updateMap();
  });
});

updateMap();

figma.ui.onmessage = uiMessageHandler;

setInterval(updateSelectionView, 100);
