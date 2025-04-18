varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;


void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(1.0);

    // Sun orientation
    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);    

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = max(0.0, fresnel);
    fresnel = pow(fresnel, 2.0);

    color = vec3(fresnel);

    gl_FragColor = vec4(color, 1.0);
}