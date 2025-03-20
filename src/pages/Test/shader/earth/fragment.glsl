uniform sampler2D uEarthDayTexture;
uniform sampler2D uEarthNightTexture;
uniform sampler2D uSpecularCloudTexture;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

uniform vec3 uSunDirection;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main()
{
    vec2 uv = vUv;
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 color = vec3(1.0);

    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);

    vec4 earthDayColor = texture2D(uEarthDayTexture, uv);
    vec4 earthNightColor = texture2D(uEarthNightTexture, uv);
    vec4 specularCloudColor = texture2D(uSpecularCloudTexture, uv);

    color = mix(
        earthNightColor.rgb,
        earthDayColor.rgb,
        dayMix
    );

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);
 
    // Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereDayMix
    );

    color = mix(
        color, 
        atmosphereColor,
        fresnel  * dayMix
    );

    // Specular
    vec3 reflection = reflect(-sunDirection, normal);
    float specular = dot(reflection, -viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, 20.0);
    specular *= specularCloudColor.r;

    color += specular;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}