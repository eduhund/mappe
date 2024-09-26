import React, { useEffect, useRef, useState } from 'react';
import '../styles/ui.css';
import { Switch } from 'antd';
import { nodesData } from '../../types';

function App() {
  const mapRef = useRef(null);

  const [frames, setFrames] = useState<nodesData | null>(null);

  const [view, setView] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [relative, setRelative] = useState(false);

  function relativeScaleSwitchHandler() {
    setRelative(!relative);
    parent.postMessage({ pluginMessage: { type: 'CHANGE_RELATIVE_SCALE', data: { value: !relative } } }, '*');
  }

  useEffect(() => {
    const canvas = mapRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 262 * 2;
    canvas.height = 262 * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frames) {
      const color = '#17141e';
      Object.values(frames).forEach(({ type, x, y, width, height }) => {
        if (type === 'SECTION') {
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + width, y);
          ctx.lineTo(x + width, y + height);
          ctx.lineTo(x, y + height);
          ctx.lineTo(x, y);
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = color;
          ctx.stroke();

          ctx.globalAlpha = 0.2;

          ctx.fillStyle = color;
          ctx.fill();
        } else {
          ctx.globalAlpha = 1;

          ctx.fillStyle = color;
          ctx.fillRect(x, y, width, height);
        }
      });
    }
  }, [frames]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data.pluginMessage;

      if (type === 'updateMap') {
        setFrames(Object.assign({}, frames, data));
      }

      if (type === 'updateSelectionView') {
        setView({ ...view, ...data });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <div id="mapContainer">
        <div id="currentView" style={view}></div>
        <canvas id="map" ref={mapRef} width="262" height="262"></canvas>
      </div>
      <label id="relativeScaleLabel" htmlFor="relativeScale">
        <Switch id="relativeScale" size="small" checked={relative} onChange={relativeScaleSwitchHandler} />
        Relative scale
      </label>
    </>
  );
}

export default App;
