import React, { useEffect, useRef, useState } from 'react';
import '../styles/ui.css';

function App() {
  const mapRef = useRef(null);

  const [frames, setFrames] = useState([
    { id: 'rect1', x: 50, y: 50, width: 200, height: 100 },
    { id: 'rect2', x: 2, y: 1, width: 10, height: 15 },
  ]);

  const [view, setView] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useEffect(() => {
    const canvas = mapRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frames.forEach(({ x, y, width, height }) => {
      ctx.fillStyle = '#666666';
      ctx.fillRect(x, y, width, height);
    });
  }, [frames]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data.pluginMessage;

      if (type === 'updateMap') {
        setFrames(data);
      }

      if (type === 'updateSelectionView') {
        setView({ ...view, ...data });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div id="mapContainer">
      <div id="currentView" style={view}></div>
      <canvas id="map" ref={mapRef} width="262" height="262"></canvas>;
    </div>
  );
}

export default App;
