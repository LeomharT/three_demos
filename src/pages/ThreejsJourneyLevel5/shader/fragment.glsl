uniform vec4 u_color;

varying vec2 v_uv;

void main(){
    vec4 color = vec4(0.0 , 0.0, 0.0, 0.0);

    float radius = 0.5;

    vec2 center = vec2(0.5, 0.5);

    float distanceToCenter = distance(v_uv, center);

    if(distanceToCenter < radius)
    {
        color = u_color;
    }


    gl_FragColor = color;
}