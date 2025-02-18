precision mediump float;

uniform vec3 uBigWaveDepthColor;
uniform vec3 uBigWaveSurfaceColor;

uniform float uBigWaveColorOffset;
uniform float uBigWaveColorMultiplier;

varying float vElevation;

void main()
{
    float elevation = (vElevation + uBigWaveColorOffset) * uBigWaveColorMultiplier;

    vec3 mixColor = mix(
        uBigWaveDepthColor, 
        uBigWaveSurfaceColor, 
        elevation
    );

    vec4 color = vec4(mixColor, 1.0);

    gl_FragColor = color;

    #include <colorspace_fragment>
}