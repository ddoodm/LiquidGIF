precision mediump float;

varying vec2 vUv;
uniform float uTime;

void main() {
    gl_FragColor = vec4(cos(uTime + vUv.x), sin(uTime + vUv.y), 0.5, 1.0);
}
