varying vec2 vUv;

uniform sampler2D uTexture;

void main()
{
    vec4 color = texture2D(uTexture, vUv);

    if(vUv.x > 0.5)
    {
        color.r = vUv.x;
        color.b = vUv.x;
    }
    if(vUv.y < 0.5)
    {
        color.b = vUv.y;
    }

    gl_FragColor = color;
}