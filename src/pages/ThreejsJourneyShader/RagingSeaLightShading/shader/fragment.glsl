precision mediump float;

varying float vElevation;

uniform vec3 uBigWaveDepthColor;
uniform vec3 uBigWaveSurfaceColor;

uniform float uBigWaveColorOffset;
uniform float uBigWaveColorMultiplier;

void main()
{
    float elevation = (vElevation + uBigWaveColorOffset) * uBigWaveColorMultiplier;

    vec3 mixColor = mix(
        uBigWaveDepthColor,
        uBigWaveSurfaceColor,
        elevation
    );
    
    gl_FragColor = vec4(mixColor, 1.0);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}