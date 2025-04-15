varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform sampler2D uEarthDayTexture;
uniform sampler2D uEarthNightTexture;
uniform sampler2D uSpecularCloudTexture;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main()
{
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 color = vec3(0.0);

    // Texture Color
    vec4 earthDayColor = texture2D(uEarthDayTexture, vUv);
    vec4 earthNightColor = texture2D(uEarthNightTexture, vUv);
    vec4 specularCloudColor = texture2D(uSpecularCloudTexture, vUv);

    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    color = mix(
        earthNightColor.xyz,
        earthDayColor.xyz,
        dayMix
    );

    // Cloud
    float cloudMix = smoothstep(0.17, 1.0, specularCloudColor.g);
    cloudMix *= dayMix;
    color = mix(
        color, 
        vec3(1.0),
        cloudMix
    );

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = max(0.0, fresnel);
    fresnel = pow(fresnel, 2.0);

    // Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphere = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereDayMix
    );

    color = mix(
        color, 
        atmosphere,
        fresnel * dayMix
    );

    // Specular
    vec3 reflection = reflect(-sunDirection, normal);
    float specular = - dot(viewDirection, reflection);
    specular = max(0.0, specular);
    specular = pow(specular, 20.0);
    specular *= specularCloudColor.r;

    vec3 specularColor = mix(vec3(1.0), atmosphere, fresnel);

    color += specular * specularColor;

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}