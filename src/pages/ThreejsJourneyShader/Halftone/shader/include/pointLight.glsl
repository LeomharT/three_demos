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