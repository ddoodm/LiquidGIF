import canvas_vert from './shaders/canvas.vert';
import canvas_frag from './shaders/canvas.frag';

export class Renderer {
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly vertexBuffer: WebGLBuffer;

    private readonly positionLocation: number;
    private readonly uTimeLocation: WebGLUniformLocation;

    private uTime: number = 0;
    private lastTime: number;

    constructor(
        private readonly canvas: HTMLCanvasElement,
    ) {
        const gl = canvas?.getContext('webgl');
    
        if (gl === null) {
          alert('Unable to initialize WebGL. Your browser or machine may not support it.');
          return;
        }
        this.gl = gl;
    
        const vertices = new Float32Array([
          -1.0, -1.0,   // First triangle
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,   // Second triangle
           1.0, -1.0,
           1.0,  1.0
        ]);
      
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
        this.program = createShaderProgram(gl, canvas_vert, canvas_frag);

        this.positionLocation = gl.getAttribLocation(this.program, 'position');
        this.uTimeLocation = gl.getUniformLocation(this.program, 'uTime');

        this.lastTime = performance.now();
    }

    render() {
        const {
            gl,
            program,
            vertexBuffer,
            positionLocation,
            uTimeLocation,
        } = this;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) * 0.001;
        this.uTime += deltaTime;
        this.lastTime = currentTime;
        gl.uniform1f(uTimeLocation, this.uTime);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
    
        gl.useProgram(program);
        gl.drawArrays(gl.TRIANGLES, 0, 6);  // 6 vertices make up the quad
    }
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }
  
  function createShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
  
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }
  