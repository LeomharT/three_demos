uniform float uTime;
uniform float uBigWaveElevation;
uniform vec2 uBigWaveFrequency;

varying float vElevation;
 
void main()
{
    vec3 dispalcementPosition = position;

    float elevation = cos(uTime + uv.x * uBigWaveFrequency.x) * uBigWaveElevation;
    elevation += sin(uTime + uv.y * uBigWaveFrequency.y) * uBigWaveElevation;

    dispalcementPosition.z += elevation;
   
    gl_Position = projectionMatrix * modelViewMatrix * vec4(dispalcementPosition, 1.0);
}