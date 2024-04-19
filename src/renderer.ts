import canvas_vert from './shaders/canvas.vert';
import canvas_frag from './shaders/canvas.frag';
import { Preconditions } from './preconditions';

export class Renderer {
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly vertexBuffer: WebGLBuffer;

    private readonly positionLocation: number;
    private readonly uTimeLocation: WebGLUniformLocation;
    private readonly uSourceLocation: WebGLUniformLocation;
    // private readonly uResolutionLocation: WebGLUniformLocation;
    private readonly uSourceResolutionLocation: WebGLUniformLocation;

    private uTime: number = 0;
    private lastTime: number;
    private source: Texture | undefined;

    constructor(
        private readonly canvas: HTMLCanvasElement,
    ) {
        this.gl = Preconditions.checkExists(canvas?.getContext('webgl'), 'no webgl');
        const { gl } = this;

        const vertices = new Float32Array([
          -1.0, -1.0,   // First triangle
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,   // Second triangle
           1.0, -1.0,
           1.0,  1.0
        ]);
      
        this.vertexBuffer = Preconditions.checkExists(gl.createBuffer(), "can't create buffer");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
        this.program = Preconditions.checkExists(createShaderProgram(gl, canvas_vert, canvas_frag), "can't create shader program");

        this.positionLocation = gl.getAttribLocation(this.program, 'position');
        this.uTimeLocation =  Preconditions.checkExists(gl.getUniformLocation(this.program, 'uTime'), 'uniform not found');
        this.uSourceLocation = Preconditions.checkExists(gl.getUniformLocation(this.program, 'uSource'), 'uniform not found');
        // this.uResolutionLocation = Preconditions.checkExists(gl.getUniformLocation(this.program, 'uResolution'), 'uniform not found');
        this.uSourceResolutionLocation = Preconditions.checkExists(gl.getUniformLocation(this.program, 'uSourceResolution'), 'uniform not found');

        this.lastTime = performance.now();
    }

    render() {
        const {
            canvas,
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

        // gl.uniform2f(this.uResolutionLocation, canvas.width, canvas.height);

        gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, this.source);
        gl.uniform1i(this.uSourceLocation, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
    
        gl.useProgram(program);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    async updateSource(url: string) {
        // TODO: dispose old one

        this.source = await loadTexture(this.gl, url);

        this.gl.uniform2f(this.uSourceResolutionLocation, this.source.width, this.source.height);
    }
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = Preconditions.checkExists(gl.createShader(type), "can't create shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    }
  
    return shader;
  }
  
  function createShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = Preconditions.checkExists(gl.createProgram(), "can't create shader program");
  
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }

  type Texture = {
    texture: WebGLTexture,
    width: number,
    height: number,
  };
  
  function loadTexture(gl: WebGLRenderingContext, url: string): Promise<Texture> {
    return new Promise<Texture>(resolve => {
      const texture = Preconditions.checkExists(gl.createTexture(), "can't create texture");
      gl.bindTexture(gl.TEXTURE_2D, texture);
  
      // Because images have to be download over the internet
      // they might take a moment until they are ready.
      // Until then put a single pixel in the texture so we can
      // use it immediately. When the image has finished downloading
      // we'll update the texture with the contents of the image.
      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    1, 1, border, srcFormat, srcType,
                    pixel);
  
      const image = new Image();
      image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                        srcFormat, srcType, image);
  
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

          resolve({
            texture,
            width: image.width,
            height: image.height,
          });
      };
      image.src = url;
    });
}