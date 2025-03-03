uniform float uTime;

uniform vec2 uBigWaveFrequency;
uniform float uBigWaveElevation;
uniform float uBigWaveSpeed;

uniform float uSmallWaveElevation;
uniform float uSmallWaveFrequency;
uniform float uSmallWaveSpeed;

varying float vElevation;
varying vec3 vPosition;
varying vec3 vNormal;

#include <perlinClassic3D>

float waveElevation(
    vec3 _position
)
{
    float elevation = sin(uTime * uBigWaveSpeed + _position.x * uBigWaveFrequency.x) *
                      sin(uTime * uBigWaveSpeed + _position.z + uBigWaveFrequency.y) *
                      uBigWaveElevation;

    for(float i = 1.0; i <= 4.0; i += 1.0)
    {
        elevation -= abs(perlinClassic3D(
            vec3(_position.xz * i * uSmallWaveFrequency, uTime * uSmallWaveSpeed)
        ) * uSmallWaveElevation / i);
    }

    return elevation;
}

void main()
{
    float shift = 0.01;

    // Model Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);

    // Elevation
    float elevation = waveElevation(modelPosition.xyz);

    modelPosition.y += elevation;
    modelPositionA.y += waveElevation(modelPositionA);
    modelPositionB.y += waveElevation(modelPositionB);

    vec3 toA = normalize(modelPositionA - modelPosition.xyz);
    vec3 toB = normalize(modelPositionB - modelPosition.xyz);

    vec3 computedNormal = cross(toA, toB);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varing
    vElevation = elevation;
    vNormal = computedNormal;
    vPosition = modelPosition.xyz;
}