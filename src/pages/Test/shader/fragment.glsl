varying vec3 vColor;

void main()
{
    vec2 center = vec2(0.5);
    
    float distanceToCenter = distance(gl_PointCoord, center);

    float strength = 1.0 - distanceToCenter;
    strength = pow(strength, 10.0);

    vec4 color = vec4(vColor * strength, 1.0);

    gl_FragColor = color;

    #include <colorspace_fragment>
}