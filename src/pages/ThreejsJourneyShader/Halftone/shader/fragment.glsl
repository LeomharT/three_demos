uniform vec3 uColor;
uniform vec2 uResolution;
uniform vec3 uShadowColor;
uniform float uShadowRepetitions;

varying vec3 vPosition;
varying vec3 vNormal;


#include <directional_light>
#include <ambient_light>
#include <point_light>

vec3 halftone(
    vec3 _color,
    float _repetitions,
    vec3 _direction,
    float _low,
    float _high,
    vec3 _pointColor,
    vec3 _normal
)
{ 
    float intensity = dot(_normal, _direction);
    intensity = smoothstep(_low, _high, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution;
    uv.x *= uResolution.x / uResolution.y;  

    uv *= _repetitions;
    uv = fract(uv);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);

    return mix(
        _color,
        _pointColor,
        point
    );
}

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    vec3 light = vec3(0.0);
    light += ambientLight(
        vec3(1.0),
        1.0
    );
    light += directionalLight(
        vec3(1.0, 1.0, 1.0),
        1.0,
        normal,
        vec3(1.0, 1.0, 0.0),
        viewDirection,
        1.0
    );

    vec3 color = uColor;
    color *= light;

    // Halftone
    float repetitions = uShadowRepetitions; 
    vec3 direction = vec3(0.0, -1.0, 0.0);
    float low = -0.8;
    float high = 1.5;
    vec3 pointColor = uShadowColor;

    color = halftone(
        color,
        repetitions,
        direction,
        low,
        high,
        pointColor,
        normal
    );

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}