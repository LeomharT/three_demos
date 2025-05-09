varying vec2 v_uv;

uniform vec4 u_color;
uniform float u_radius;
uniform float u_aspect;

void main()
{
    vec4 color = u_color;

    vec2 uv = vec2(v_uv.x * u_aspect, v_uv.y);

    vec2 bottomLeftCenter = vec2(u_radius,u_radius);
    vec2 topLeftCenter = vec2(u_radius, 1.0 - u_radius);
    vec2 bottomRightCenter = vec2(1.0 * u_aspect - u_radius, u_radius);
    vec2 topRightCenter = vec2(1.0 * u_aspect - u_radius, 1.0  - u_radius);

    float distanceToCenterBottomLeft = distance(uv, bottomLeftCenter);
    float distanceToCenterTopLeft = distance(uv, topLeftCenter);
    float distanceToCenterBottomRight = distance(uv, bottomRightCenter);
    float distanceToCenterTopRight = distance(uv, topRightCenter);

    if(uv.x < bottomLeftCenter.x && uv.y < bottomLeftCenter.y && distanceToCenterBottomLeft > u_radius)
    { 
        color = vec4(1.0, 1.0, 1.0, 0.0);   
    }

    if(uv.x < topLeftCenter.x && uv.y > topLeftCenter.y && distanceToCenterTopLeft > u_radius)
    {
        color = vec4(1.0, 1.0, 1.0, 0.0);   
    }

    if(uv.x > bottomRightCenter.x && uv.y < bottomRightCenter.y && distanceToCenterBottomRight > u_radius)
    {
        color = vec4(1.0, 1.0, 1.0, 0.0);   
    }

    if(uv.x > topRightCenter.x &&  uv.y > topRightCenter.y && distanceToCenterTopRight > u_radius)
    {
        color = vec4(1.0, 1.0, 1.0, 0.0);   
    }

    gl_FragColor = color;
}