uniform float uSize;
uniform float uProgress;

uniform vec2 uResolution;

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;
varying vec3 vPosition;

#include <simplexNoise>


void main()
{
    float noiseOrigin = simplexNoise3d(position * 0.2);
    float noiseTarget = simplexNoise3d(aPositionTarget * 0.2);
    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.4;
    float delay =(1.0 - duration) * noise;
    float end = duration + delay;
    float progress = smoothstep(delay, end, uProgress);

    // Displacement
    vec3 displacementPosition = mix(
        position,
        aPositionTarget,
        progress
    );

    // Final Position
    vec4 modelPosition = modelMatrix * vec4(displacementPosition, 1.0);
    vec4 viewMatrix = viewMatrix * modelPosition ;
    vec4 projectionPosition = projectionMatrix * viewMatrix;

    gl_Position = projectionPosition;

    // Point Size
    gl_PointSize = uSize * uResolution.y * aSize;
    gl_PointSize *= (1.0 / -viewMatrix.z);

    // Varyings 
    vColor = vec3(noise);
    vPosition = modelPosition.xyz;
}