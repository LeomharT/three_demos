uniform vec4 u_color;
uniform float u_height;
 
varying vec3 v_position;
varying vec2 v_uv;

void main()
{
    vec2 uv = v_uv;

    float intensity =1.0 - smoothstep(0.0, u_height, length(v_position.xz));

    vec4 color = vec4(v_position.x, v_position.x, 0.5, 1.0);

    gl_FragColor = color;
}