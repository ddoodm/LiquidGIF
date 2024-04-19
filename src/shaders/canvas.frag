precision mediump float;

varying vec2 vUv;

uniform float uTime;
// uniform vec2 uResolution;
uniform vec2 uSourceResolution;

uniform sampler2D uSource;

vec2 displace(vec2 uv) {
    uv.x += 0.15 * sin(uTime * 10. + (1.0 - uv.y) * 3.) * (1.0 - uv.y);
    uv.y += pow(1.0 - uv.y, 0.5) * 0.05 * -cos(uTime * 10. + uv.x * 3.5);
    return uv;
}

void main() {
    float aspect = uSourceResolution.x / uSourceResolution.y;
    vec2 uv = vUv;
    uv.x /= aspect;

    gl_FragColor = vec4(0.0);

    vec2 displaced = displace(uv);
    if(displaced.x < 0. || displaced.x > 1.)
        return;
    if(displaced.y < 0. || displaced.y > 1.)
        return;

    vec4 tex = texture2D(uSource, displaced);

    gl_FragColor = tex;

    // gl_FragColor = vec4(
    //     cos(uTime * 5.0 + uv.x) * 0.5 + 0.5,
    //     sin(uTime * 5.4 + uv.y) * 0.5 + 0.5,
    //     0.5,
    //     1.0) * tex;
}
