precision mediump float;

varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
    vec3 color = vec3(0.0);
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = max(0.0, fresnel);
    fresnel = pow(fresnel, 2.0);

    color = vec3(fresnel);

    gl_FragColor = vec4(color, 1.0);
}