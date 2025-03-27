varying vec2 vUv;
varying float vWobble;

attribute vec4 tangent;

uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;

uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

#include <simplex4DNoise>

float getWobble(vec3 position)
{
    vec3 warpedPosition = position;
    warpedPosition += snoise(vec4(
        position * uWarpPositionFrequency,
        uTime * uWarpTimeFrequency
    )) * uWarpStrength;

    float wobble = snoise(vec4(
        // XYZ
        warpedPosition * uPositionFrequency,
        // W
        uTime * uTimeFrequency
    )) * uStrength;

    return wobble;
}

void main()
{
    // Bitangent
    vec3 biTangent = cross(normal, tangent.xyz);

    // Neighbours position 
    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;

    // Wobble
    float wobble = getWobble(csm_Position);
    csm_Position += wobble * normal;
    positionA += getWobble(positionA) * normal;
    positionB += getWobble(positionB) * normal;

    // Compute Normal
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

    // Varying 
    vUv = uv;
    vWobble = wobble / uStrength;
}