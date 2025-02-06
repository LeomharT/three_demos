varying vec2 vUv;

uniform sampler2D uTexture;

void main()
{
    vec2 uv = vUv;

    uv *= 5.0;

    uv = fract(uv);

    vec4 color = texture2D(uTexture, uv);

    if(uv.x > 0.5)
    {
        color.r = uv.x;
        color.b = uv.x;
    }
    if(uv.y < 0.5)
    {
        color.b = uv.y;
    }

    gl_FragColor = color;
}