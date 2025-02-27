uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 ambientLight(vec3 _lightColor, float _intensity)
{
    return _lightColor * _intensity;
}

vec3 directionalLight(
    vec3 _lightColor, 
    float _intensity, 
    vec3 _normal, 
    vec3 _lightPosition,
    vec3 _viewDirection,
    float _specularPower
)
{
    vec3 lightDirection = normalize(_lightPosition);
    vec3 lightReflection = reflect(-lightDirection, _normal);

    float shading = dot(_normal, lightDirection);
    shading = max(0.0, shading);

    float specular = -dot(lightReflection, _viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, _specularPower);

    return _lightColor * _intensity * (shading + specular);
}

vec3 pointLight(
    vec3 _lightColor, 
    float _intensity, 
    vec3 _normal, 
    vec3 _lightPosition,
    vec3 _viewDirection,
    float _specularPower,
    vec3 _position,
    float _lightDecay
)
{
    vec3 lightDelta = _lightPosition - _position;
    vec3 lightDirection = normalize(lightDelta);
    vec3 lightReflection = reflect(-lightDirection, _normal);
    float lightDistance = length(lightDelta);

    float shading = dot(_normal, lightDirection);
    shading = max(0.0, shading);

    float specular = -dot(lightReflection, _viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, _specularPower);

    float decay = 1.0 - lightDistance * _lightDecay;
    decay = max(0.0, decay);

    return _lightColor * _intensity * decay * (shading + specular);
}


void main()
{
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 light = vec3(0.0);
    light += ambientLight(
        vec3(1.0), 
        0.03
    );
    light += directionalLight(
        vec3(0.1,0.1,1.0),
        1.0,
        normal,
        vec3(0.0, 0.0, 3.0),
        viewDirection,
        20.0
    );
    light += pointLight(
        vec3(1.0,0.1,0.1),
        1.0,
        normal,
        vec3(0.0, 2.5, 0.0),
        viewDirection,
        20.0,
        vPosition,
        0.25
    );

    vec3 color = uColor;
    color *= light;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}