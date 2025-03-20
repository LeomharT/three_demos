varying vec3 vColor;
varying vec3 vPosition;

uniform vec3 uColorA;
uniform vec3 uColorB;

#include <simplexNoise>


void main()
{
    vec2 center = vec2(0.5);
    vec2 uv = gl_PointCoord;
    
    float distanceToCenter = distance(uv, center);
    
    float alpha = 0.05 / distanceToCenter - 1.0;

    float mixA = simplexNoise3d(vPosition);

    vec3 color = mix(
        uColorA,
        uColorB,
        mixA
    );

    color *= vColor;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}