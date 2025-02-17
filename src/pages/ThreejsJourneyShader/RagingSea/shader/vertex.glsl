uniform float uTime;
 

void main()
{
    vec3 dispalcementPosition = position;

    float elevation = cos(uTime + uv.x * 10.0) * 0.1;
    elevation += sin(uTime + uv.y * 10.0) * 0.1;

    dispalcementPosition.z += elevation;
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(dispalcementPosition, 1.0);
}