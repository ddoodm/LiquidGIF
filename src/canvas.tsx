import * as React from 'react';
import { Renderer } from './renderer';

export const Canvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new Renderer(canvas);

    const render = () => {
      renderer.render();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

  }, []);

  return <canvas ref={canvasRef} width="640" height="480" />;
};
