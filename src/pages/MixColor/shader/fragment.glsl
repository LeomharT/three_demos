uniform vec4 u_color1;
uniform vec4 u_color2;

varying vec2 v_uv;


void main()
{
    vec2 uv = v_uv;

    vec4 mixColor = mix(u_color1, u_color2, uv.x);

    vec4 color = mixColor;

    gl_FragColor = color;
}