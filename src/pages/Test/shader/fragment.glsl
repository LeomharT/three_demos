void main()
{
    vec3 color = vec3(1.0);

    vec2 center = vec2(0.5);

    float distanceToCenter = distance(center, gl_PointCoord);

    if(distanceToCenter > 0.5) discard;

    gl_FragColor = vec4(color, 1.0);
}