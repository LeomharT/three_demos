varying vec2 vUv;
 
uniform sampler2D uTexture;


void main()
{
    vec2 uv = vUv;

    vec4 color = texture2D(uTexture, uv);

    color.r = uv.x;
    color.g = uv.y;
      
    gl_FragColor = color;
}