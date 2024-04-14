import canvas_vert from './shaders/canvas.vert';
import canvas_frag from './shaders/canvas.frag';

export class Renderer {
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly vertexBuffer: WebGLBuffer;

    private readonly positionLocation: number;
    private readonly uTimeLocation: WebGLUniformLocation;
    private readonly uSourceLocation: WebGLUniformLocation;

    private uTime: number = 0;
    private lastTime: number;
    private source: WebGLTexture;

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
        this.uSourceLocation = gl.getUniformLocation(this.program, 'uSource')

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

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.source);
        gl.uniform1i(this.uSourceLocation, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
    
        gl.useProgram(program);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    updateSource(url: string) {
        // TODO: dispose old one

        this.source = loadTexture(this.gl, url);
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
  
  function loadTexture(gl: WebGLRenderingContext, url: string) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      srcFormat, srcType, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    image.src = url;

    return texture;
}