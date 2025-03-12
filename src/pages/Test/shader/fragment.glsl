varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform sampler2D uEarthDayTexture;
uniform sampler2D uEarthNightTexture;
uniform sampler2D uEarthSpecularCloudTexture;

uniform vec3 uSunDirection;

void main()
{
    vec2 uv = vUv;
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 color = vec3(0.0);

    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    // Earth Map
    float dayMix = smoothstep(-0.25, 1.0, sunOrientation);
 
    vec3 dayMap = texture2D(uEarthDayTexture, uv).rgb;
    vec3 nightMap = texture2D(uEarthNightTexture, uv).rgb;
    vec2 specularMap = texture2D(uEarthSpecularCloudTexture, uv).rg;

    color = mix(
        nightMap,
        dayMap,
        dayMix
    );

    // Clouds
    float cloudMix = smoothstep(0.5, 1.0, specularMap.g);
    cloudMix *= dayMix;
    color = mix(
        color,
        vec3(1.0),
        cloudMix
    );

    if(!gl_FrontFacing)
    {
        normal *= -1.0;
    }

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Specular
    vec3 reflection = reflect(-sunDirection, normal);
    float specular = -dot(reflection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, 20.0);
    specular *= specularMap.r;
 
    color += specular;

    color = vec3(fresnel);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}