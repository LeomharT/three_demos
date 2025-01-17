varying vec2 vUv;

uniform vec4 uColor;

void main()
{
    vec2 uv = vUv;

    vec4 color = uColor;

    float radius = 0.5;

    vec2 center = vec2(0.5, 0.5);

    float distanceToCenter = distance(uv, center); 

    if(distanceToCenter > radius)
    {
        color.a = 0.0;
    }

    gl_FragColor = color;
}