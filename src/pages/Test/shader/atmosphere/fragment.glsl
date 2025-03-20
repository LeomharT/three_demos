varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;


uniform vec3 uSunDirection;

void main()
{
    vec3 color = vec3(0.0);
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    // Atmosphere Color 
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereDayMix
    );
    color += atmosphereColor;

    // Fresnel
    // Alpha
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    // Day Alpha
    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation); 

    float alpha = edgeAlpha * dayAlpha;
 
    gl_FragColor = vec4(color, alpha);   

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}