varying vec2 v_uv;
varying vec3 v_position;

uniform float u_height;
uniform vec3 u_color;

void main()
{
    float intensity = 1.0 - smoothstep(0.0, u_height, length(v_position.xz));  
    vec4 color = vec4(1.0, 1.0, 1.0, intensity);
    
    gl_FragColor = color;
}