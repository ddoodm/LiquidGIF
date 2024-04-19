import * as React from 'react';
import { Renderer } from './renderer';

export const Canvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const renderer = new Renderer(canvas);

    renderer.updateSource('fofo.png');

    const render = () => {
      renderer.render();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

  }, []);

  return <canvas ref={canvasRef} width="640" height="640" />;
};
