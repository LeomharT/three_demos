precision mediump float;

uniform vec3 uBigWaveDepthColor;
uniform vec3 uBigWaveSurfaceColor;

uniform float uBigWaveColorOffset;
uniform float uBigWaveColorMultiplier;

varying float vElevation;
varying vec3 vNormal;

void main()
{
    vec3 normal = normalize(vNormal);

    float mixStrength = (vElevation + uBigWaveColorOffset) * uBigWaveColorMultiplier;
    mixStrength = smoothstep(0.0, 1.0, mixStrength);

    vec3 mixColor = mix(
        uBigWaveDepthColor,
        uBigWaveSurfaceColor,
        mixStrength
    );
    
    gl_FragColor = vec4(mixColor, 1.0);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}