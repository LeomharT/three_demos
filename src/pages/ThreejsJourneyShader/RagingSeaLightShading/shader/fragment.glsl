precision mediump float;

uniform vec3 uBigWaveDepthColor;
uniform vec3 uBigWaveSurfaceColor;

uniform float uBigWaveColorOffset;
uniform float uBigWaveColorMultiplier;

varying float vElevation;
varying vec3 vPosition;
varying vec3 vNormal;

#include <directionalLight>
#include <pointLight>

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    vec3 light = vec3(0.0);

    light += directionalLight(
        vec3(1.0),
        1.0,
        normal,
        vec3(-1.0, 0.5, 0.0),
        viewDirection,
        30.0
    );

    float mixStrength = (vElevation + uBigWaveColorOffset) * uBigWaveColorMultiplier;
    mixStrength = smoothstep(0.0, 1.0, mixStrength);

    vec3 mixColor = mix(
        uBigWaveDepthColor,
        uBigWaveSurfaceColor,
        mixStrength
    );

    mixColor *= light;
    
    gl_FragColor = vec4(normal, 1.0);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}