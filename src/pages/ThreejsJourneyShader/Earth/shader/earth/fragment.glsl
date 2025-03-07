varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform float uTextureMixEdge0;
uniform float uTextureMixEdge1;
uniform float uCloudsVolume;

uniform sampler2D uDayMapTexture;
uniform sampler2D uNightMapTexture;
uniform sampler2D uSpecularCloudsTexture;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main()
{
    vec2 uv = vUv;
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation
    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    float dayMix = smoothstep(
        uTextureMixEdge0, 
        uTextureMixEdge1, 
        sunOrientation
    );

    vec3 dayColor = texture2D(uDayMapTexture, uv).rgb;
    vec3 nightColor = texture2D(uNightMapTexture, uv).rgb;

    color = mix(
        nightColor,
        dayColor,
        dayMix
    );

    vec2 specularTexture = texture2D(uSpecularCloudsTexture, uv).rg;

    // Clouds
    float cloudsMix = smoothstep(uCloudsVolume, 1.0, specularTexture.g);
    cloudsMix *= dayMix;
    color = mix(
        color,
        vec3(1.0),
        cloudsMix
    );

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereDayColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereDayMix
    );
    color = mix(
        color,
        atmosphereDayColor,
        fresnel * atmosphereDayMix
    );

    // Speculare
    vec3 reflection = reflect(-sunDirection, normal);
    float specular = - dot(viewDirection, reflection);
    specular = max(0.0, specular);
    specular = pow(specular, 20.0);
    specular *= specularTexture.r;

    vec3 specularColor = mix(vec3(1.0), atmosphereDayColor, fresnel);

    color += specular * specularColor;

    // Final Color
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}