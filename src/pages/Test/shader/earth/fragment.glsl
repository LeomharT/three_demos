varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform sampler2D uEarthDayTexture;
uniform sampler2D uEarthNightTexture;
uniform sampler2D uSpecularCloudTexture;

uniform vec3 uSunDirection;

void main()
{
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 color = vec3(1.0);

    // Texture Color
    vec4 earthDayColor = texture2D(uEarthDayTexture, vUv);
    vec4 earthNightColor = texture2D(uEarthNightTexture, vUv);
    vec4 specularCloudColor = texture2D(uSpecularCloudTexture, vUv);

    vec3 sunDirection = uSunDirection;
    float sunOriantation = dot(sunDirection, normal);

    float dayMix = smoothstep(-0.25, 0.5, sunOriantation);
    color = mix(
        earthNightColor.xyz,
        earthDayColor.xyz,
        dayMix
    );

    // Specular
    vec3 reflection = reflect(-sunDirection, normal);
    float specular = dot(viewDirection, reflection);
    specular = max(0.0, specular);
    specular = pow(specular, 20.0);
    color += specularCloudColor.r * specular;

    // Fresnel
    float fresnel = 1.0 - dot(viewDirection, normal);
    fresnel = max(0.0, fresnel);
    fresnel = pow(fresnel, 2.0);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}