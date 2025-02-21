varying float vElevation;

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

void main()
{
    vec3 mixColor = mix(uDepthColor, uSurfaceColor, vElevation);

    vec4 color = vec4(mixColor, 1.0);

    gl_FragColor = color;
}