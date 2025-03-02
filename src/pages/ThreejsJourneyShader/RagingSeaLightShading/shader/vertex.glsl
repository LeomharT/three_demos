uniform float uTime;

uniform vec2 uBigWaveFrequency;
uniform float uBigWaveElevation;
uniform float uBigWaveSpeed;

uniform float uSmallWaveElevation;
uniform float uSmallWaveFrequency;
uniform float uSmallWaveSpeed;

varying float vElevation;
varying vec3 vNormal;

#include <perlinClassic3D>

void main()
{

    // Model Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    // Elevation
    float elevation = sin(uTime * uBigWaveSpeed + modelPosition.x * uBigWaveFrequency.x) *
                      sin(uTime * uBigWaveSpeed + modelPosition.z + uBigWaveFrequency.y) *
                      uBigWaveElevation;

    for(float i = 1.0; i <= 4.0; i += 1.0)
    {
        elevation -= abs(perlinClassic3D(
            vec3(modelPosition.xz * i * uSmallWaveFrequency, uTime * uSmallWaveSpeed)
        ) * uSmallWaveElevation / i);
    }

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varing
    vElevation = elevation;
    vNormal = modelNormal.xyz;
}