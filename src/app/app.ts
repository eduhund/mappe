const MAX_SPACE = 262143;
const FRAME_SIZE = 262;

function uiMessageHandler(message) {
  console.log('Message from UI:', message);
  // Fetch UI messages
}

function getNodes() {
  return figma.currentPage.children;
}

function getMapCorners(nodes) {
  let [x1, y1, x2, y2] = [0, 0, 0, 0];

  nodes.forEach((node) => {
    const { x, y, width, height } = node;
    const xx = x + width;
    const yy = y + height;

    const [xStart, xEnd] = x < xx ? [x, xx] : [xx, x];
    const [yStart, yEnd] = y < yy ? [y, yy] : [yy, y];

    if (xStart < x1) x1 = xStart;
    if (xEnd > x2) x2 = xEnd;
    if (yStart < y1) x1 = xStart;
    if (yEnd > y2) y2 = yEnd;
  });

  return [Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2)];
}

function getScale([x1, y1, x2, y2]: number[]) {
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  return Math.round(((width > height ? width : height) / MAX_SPACE / FRAME_SIZE) * 1000) / 1000 || 0.001;
}

function calcNodesPreview(nodes, scale) {
  return nodes.map((node) => {
    const { id, x, y, width, height } = node;
    return {
      id,
      x: Math.ceil((x + MAX_SPACE / 2) * scale),
      y: Math.ceil((y + MAX_SPACE / 2) * scale),
      width: Math.round(width * scale) || 1,
      height: Math.round(height * scale) || 1,
    };
  });
}

function updateMap() {
  const nodes = getNodes();
  const corners = getMapCorners(nodes);
  const scale = getScale(corners);
  const nodesPreview = calcNodesPreview(nodes, scale);
  figma.ui.postMessage({ type: 'updateMap', data: nodesPreview });
  //getCurrentView
  //sendMapData
}

figma.showUI(__html__, {
  width: 262,
  height: 262,
});

updateMap();

figma.ui.onmessage = uiMessageHandler;
