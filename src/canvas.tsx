import * as React from 'react';

export const Canvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl');

    if (gl === null) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // More WebGL setup code and drawing code would go here
  }, []);

  return <canvas ref={canvasRef} width="640" height="480" />;
};
