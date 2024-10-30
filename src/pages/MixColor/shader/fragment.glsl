uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_angle;

varying vec2 v_uv;


void main()
{
    vec2 uv = v_uv;

    float angle = radians(u_angle);

    float cosAngle = cos(angle);
    float sinAngle = sin(angle);

    vec2 rotateUV = vec2(
        cosAngle * (v_uv.x - 0.5) + sinAngle * (v_uv.y - 0.5) + 0.5,
        -sinAngle * (v_uv.x - 0.5) + cosAngle * (v_uv.y - 0.5) + 0.5
    );

    vec4 mixColor = mix(u_color1, u_color2, rotateUV.x);

    vec4 color = mixColor;
 
    gl_FragColor = color;
}