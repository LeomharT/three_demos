uniform vec4 u_color;
uniform float u_time;

varying vec2 v_uv;

float smoothAlpha(float circleRadius, float x)
{
    return smoothstep(circleRadius - 0.05, circleRadius, x);
}

void main(){
    vec2 uv = v_uv;
        
    float radius = 0.5;

    float borderWidth = 0.005;

    vec4 color = vec4(0.0 , 0.0, 0.0, 0.0);

    vec2 center = vec2(0.5, 0.5);

    float distanceToCenter = distance(uv, center);

    for(float i = 0.0; i < u_time; i += 0.1)
    {
        float circleRadius = u_time - i;

        float alpha = smoothAlpha(circleRadius, distanceToCenter);

        if(distanceToCenter < circleRadius)
        {
            color = vec4(u_color.r, u_color.g, u_color.b, alpha); 
        }
    }

    uv *= 10.0;
    uv += u_time * 10.0;
    uv = fract(uv);

    float lineGap = 1.0 / 5.0;

    for(float i = 0.0; i < 5.0; i += 1.0)
    {
        float lineWidth = 0.01;

        if(i == 0.0){
            lineWidth *= 2.0;
        }

        float gap = i * lineGap;

        if(uv.x > gap && uv.x < gap + lineWidth)
        {
            color = u_color;
        }
        if(uv.y > gap && uv.y < gap + lineWidth)
        {
            color = u_color;
        }
    }

    if(distanceToCenter > radius)
    {
        color = vec4(0.0 , 0.0, 0.0, 0.0);
    }

    if(
        distanceToCenter < radius && 
        distanceToCenter > radius - borderWidth
    ) {
        color = u_color;
    }

    gl_FragColor = color;
}