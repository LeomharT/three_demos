varying vec3 vNormal;


uniform vec3 uDirectionalLightColor;


vec3 ambientLight(
    vec3 _color,
    float _intensity
){
    return _color * _intensity;
}

vec3 directionalLight(
    vec3 _color,
    float _intensity,
    vec3 _normal,
    vec3 _lightPosition
){
    vec3 lightDirection = normalize(_lightPosition);

    float shading = dot(lightDirection, _normal);
    shading = max(0.0, shading);

    return _color * _intensity * shading;
}


void main()
{
    vec3 normal = normalize(vNormal);

    // Without any light, everything is black
    vec3 light = vec3(0.0);

    // light += ambientLight(
    //     vec3(0.25, 0.12, 0.36),
    //     1.0
    // );
    light += directionalLight(
        uDirectionalLightColor,
        1.0,
        normal,
        vec3(0.0, 0.0, 3.0)
    );

    vec3 color = vec3(1.0);
    color *= light;

    gl_FragColor = vec4(color, 1.0);
}