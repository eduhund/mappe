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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frames) {
      Object.values(frames).forEach(({ x, y, width, height }) => {
        ctx.fillStyle = '#666666';
        ctx.fillRect(x, y, width, height);
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
