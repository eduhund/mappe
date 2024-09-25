import React, { useEffect, useRef, useState } from 'react';
import '../styles/ui.css';

function App() {
  const mapRef = useRef(null);

  const [frames, setFrames] = useState([
    { id: 'rect1', x: 50, y: 50, width: 200, height: 100 },
    { id: 'rect2', x: 2, y: 1, width: 10, height: 15 },
  ]);

  useEffect(() => {
    const canvas = mapRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frames.forEach(({ x, y, width, height }) => {
      console.log(x, y, width, height);
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, width, height);
    });
  }, [frames]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data.pluginMessage;

      if (type === 'updateMap') {
        setFrames(data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <canvas id="map" ref={mapRef} width="262" height="262"></canvas>;
}

export default App;
