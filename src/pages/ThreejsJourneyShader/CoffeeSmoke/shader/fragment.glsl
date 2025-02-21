varying float vElevation;

void main()
{
    vec3 baseColor = vec3(0.85, 0.125, 0.4);

    vec4 color = vec4(baseColor * vElevation, 1.0);
    
    gl_FragColor = color;
}