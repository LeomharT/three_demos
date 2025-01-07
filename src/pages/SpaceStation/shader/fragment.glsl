uniform sampler2D u_texture;

varying vec2 v_uv;



void main()
{
    vec2 uv = v_uv;

    vec2 offset = vec2(0.05, 0.0);

    vec4 color = vec4(1.0, 0.75, 0.23, 1.0);
    
    // Alpha map usually use red channel
    vec4 alpha = texture2D(u_texture, uv);

    float r = smoothstep(0.0, 1.0, uv.x);
    float g = smoothstep(0.0, 1.0, uv.x);
    float b = smoothstep(0.0, 1.0, uv.x);
 
    vec4 final = vec4(vec3(r, g,b), r);

    gl_FragColor = final;

    if(gl_FragColor.a < 0.01)
    {
        // Cancle fragment
        discard;
    }
}