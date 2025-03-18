varying vec2 vUv;
varying vec3 vColor;

void main()
{    
    vec2 uv = gl_PointCoord;

    vec2 center = vec2(0.5);

    float distanceToCenter = distance(uv, center);
 
    if(distanceToCenter > 0.5){
        discard;
    }

    vec3 colors = vec3(vUv.x, vUv.y, 1.0);

    gl_FragColor = vec4(colors * vColor, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}