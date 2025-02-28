uniform vec3 uMaterialColor;
uniform vec3 uAmbientLightColor;
uniform vec3 uDirectionalLightColor;

varying vec3 vNormal;

vec3 ambientLight(vec3 _color, float _intensity)
{
    return _color * _intensity;
}

vec3 directionalLight(
    vec3 _color, 
    float _intensity, 
    vec3 _normal,
    vec3 _lightPosition
)
{
    // Normalize make sure wont over 1.0
    vec3 lightDirection = normalize(_lightPosition);

    vec3 lightReflection = reflect(lightDirection, _normal);

    float shading = dot(lightDirection, _normal);
    shading = max(0.0, shading);

    // return vec3 (shading);

    return _color * _intensity * shading;
}


void main()
{
    vec3 normal = normalize(vNormal);

    vec3 light = vec3(0.0);
    // Ambient Light
    // light += ambientLight(
    //     uAmbientLightColor,
    //     1.0
    // );

    // Directional Light
    light += directionalLight(
        uDirectionalLightColor,
        1.0,
        normal,
        vec3(0.0, 0.0, 3.0)
    );


    vec3 color = uMaterialColor;
    color *= light;
    
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}