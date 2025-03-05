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
