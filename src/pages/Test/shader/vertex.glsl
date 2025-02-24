varying vec2 vUv;

uniform float uTime;
uniform sampler2D uNoiseTexture;


vec2 rotate2d(vec2 value, float _angle){
    mat2 m = mat2(cos(_angle),-sin(_angle),
                  sin(_angle),cos(_angle));

    return value * m;
}

void main()
{
    vec3 displacementPosition = position;

    float elevation = texture2D(uNoiseTexture, vec2(0.5,  uv.y * 0.2 - uTime * 0.45)).r;
    elevation *= 10.0;
    displacementPosition.xz = rotate2d(displacementPosition.xz, elevation);

    // Wind
    vec2 windOffset = vec2(
        texture2D(uNoiseTexture, vec2(0.25,  uTime)).r - 0.5,
        texture2D(uNoiseTexture, vec2(0.75,  uTime)).r - 0.5
    );
    windOffset *= pow(uv.y, 2.0);
    displacementPosition.xz += windOffset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacementPosition, 1.0);

    vUv = uv;
}