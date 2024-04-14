precision mediump float;

varying vec2 vUv;
uniform float uTime;

uniform sampler2D uSource;

void main() {
    vec4 tex = texture2D(uSource, vUv);

    gl_FragColor = vec4(
        cos(uTime * 5.0 + vUv.x) * 0.5 + 0.5,
        sin(uTime * 5.4 + vUv.y) * 0.5 + 0.5,
        0.5,
        1.0) * tex;
}
