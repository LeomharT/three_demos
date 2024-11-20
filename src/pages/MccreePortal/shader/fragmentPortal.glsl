varying vec2 v_uv;
 
uniform float u_radius;
uniform float u_aspect;
uniform sampler2D u_texture;

#include <packing>


void main()
{
    vec2 uv = vec2(v_uv.x * u_aspect, v_uv.y); 

    vec4 color = texture2D(u_texture, v_uv);

    vec2 bottomLeftCenter = vec2(u_radius,u_radius);
    vec2 topLeftCenter = vec2(u_radius, 1.0 - u_radius);
    vec2 bottomRightCenter = vec2(1.0 * u_aspect - u_radius, u_radius);
    vec2 topRightCenter = vec2(1.0 * u_aspect - u_radius, 1.0  - u_radius);

    float distanceToCenterBottomLeft = distance(uv, bottomLeftCenter);
    float distanceToCenterTopLeft = distance(uv, topLeftCenter);
    float distanceToCenterBottomRight = distance(uv, bottomRightCenter);
    float distanceToCenterTopRight = distance(uv, topRightCenter);

 
    if(
    (uv.x < bottomLeftCenter.x && uv.y < bottomLeftCenter.y && distanceToCenterBottomLeft > u_radius) || 
    (uv.x < topLeftCenter.x && uv.y > topLeftCenter.y && distanceToCenterTopLeft > u_radius) || 
    (uv.x > bottomRightCenter.x && uv.y < bottomRightCenter.y && distanceToCenterBottomRight > u_radius) ||
    (uv.x > topRightCenter.x &&  uv.y > topRightCenter.y && distanceToCenterTopRight > u_radius)
    )
    { 
        color = vec4(1.0, 1.0, 1.0, 0.0);   
    }
  
    gl_FragColor = color;

    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
}