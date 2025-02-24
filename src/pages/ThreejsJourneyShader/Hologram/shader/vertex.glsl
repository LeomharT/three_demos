varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main(void)
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vUv = uv;
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}