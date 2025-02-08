
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform float uTime;

attribute vec2 uv;
attribute vec3 position;

varying vec2 vUv;
varying float vElevation;

void main()
{
    vUv = uv;

    vec3 displacementPosition = position;

    float elevation = sin(uTime + position.x * 10.0) * 0.1;
    elevation += cos(uTime + position.y * 5.0) * 0.1;

    displacementPosition.z  = elevation;

    vElevation = elevation;

    gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(displacementPosition, 1.0);
}