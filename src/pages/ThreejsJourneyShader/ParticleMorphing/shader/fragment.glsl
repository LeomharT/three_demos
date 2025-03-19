varying vec3 vColor;

void main()
{
    vec2 center = vec2(0.5);
    vec2 uv = gl_PointCoord;
    
    float distanceToCenter = distance(uv, center);
    
    float alpha = 0.05 / distanceToCenter - 1.0;

    vec3 color = vColor;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}