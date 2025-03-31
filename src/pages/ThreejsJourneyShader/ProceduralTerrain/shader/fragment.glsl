#include <simplex2DNoise>

uniform float uTime;

uniform vec3 uColorWaterDepth;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorSnow;
uniform vec3 uColorRock;

varying float vUpDot;
varying vec3 vPosition;

void main()
{
    vec3 color = vec3(1.0);


    // Water
    float surfaceWaterMix = smoothstep(-1.0, -0.1, vPosition.y);
    color = mix(uColorWaterDepth, uColorWaterSurface, surfaceWaterMix);

    // Sand
    float sandMix = step(-0.1, vPosition.y);
    color = mix(color, uColorSand, sandMix);

    // Grass
    float grassMix = step(-0.06, vPosition.y);
    color = mix(color, uColorGrass, grassMix);

    // Snow
    float snowThreshold = 0.45;
    snowThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.1;
    float snowMix = step(snowThreshold, vPosition.y);
    color = mix(color, uColorSnow, snowMix);

    // Rock
    float rockMix = vUpDot;
    rockMix = 1.0 - step(0.8, rockMix);
    // 0 under grass level
    rockMix *= step(-0.06, vPosition.y);
    color = mix(color, uColorRock, rockMix);

    csm_DiffuseColor = vec4(vec3(color), 1.0);
}