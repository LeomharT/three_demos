uniform float uTime;

varying float vElevation;
varying vec2 vUv;

void main()
{
    vec3 displacementPosition = position;

    float elevation = sin(uTime + displacementPosition.x * 4.0) * 0.3;
    elevation += sin(uTime + displacementPosition.y * 1.5) * 0.3;
    displacementPosition.z = elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacementPosition, 1.0);

    vElevation = elevation;

    vUv = uv;
}  