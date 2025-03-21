varying vec3 vColor;

void main()
{
    vec3 color = vColor;

    vec2 uv = gl_PointCoord;

    vec2 center = vec2(0.5);

    float distanceToCenter = distance(center, uv);

    if(distanceToCenter > 0.5)
    {
        discard;
    }

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}