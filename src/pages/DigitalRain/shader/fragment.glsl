varying vec2 v_uv;

uniform float u_time;


float random(float val){
   return fract(sin(val * 12.9898) * 43758.545323);
}

void main()
{
    vec2 uv = v_uv;

    float column = 5.0;
     
    uv.x *= column;
    uv.x = floor(uv.x);

    float speed = cos(uv.x) * 0.2 + random(uv.x + 2.1) * 0.2 + 0.35; 
   
    uv.y += sin(uv.x) + u_time * speed;

    float col = 0.1 / fract(uv.y);

    vec4 color = vec4(vec3(col), 1.0);

    gl_FragColor = color;
}