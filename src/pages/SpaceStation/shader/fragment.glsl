uniform sampler2D u_texture;

varying vec2 v_uv;

void main()
{
    vec2 uv = v_uv;

    vec4 color = vec4(1.0, 0.75, 0.23, 1.0);

    vec4 alpha = texture2D(u_texture, uv);

    vec4 final = vec4(color.rgb, 0.1);

    gl_FragColor = final;

    if(gl_FragColor.a > 1.0)
    {
        discard;
    }
}