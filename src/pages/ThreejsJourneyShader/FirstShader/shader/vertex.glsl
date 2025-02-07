uniform float uTime;

varying vec2 vUv;
 
 
void main()
{
    vUv = uv;

    vec3 displacementPosition = position;

    displacementPosition.z = sin(uTime + position.x * 20.0) * 0.1;
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacementPosition, 1.0);
}