varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform sampler2D uEarthDayTexture;
uniform sampler2D uEarthNightTexture;

uniform vec3 uSunDirection;

void main()
{
    vec2 uv = vUv;
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 color = vec3(0.0);

    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    float dayMix = smoothstep(-0.25, 1.0, sunOrientation);
 
    vec3 dayMap = texture2D(uEarthDayTexture, uv).rgb;
    vec3 nightMap = texture2D(uEarthNightTexture, uv).rgb;

    color = mix(
        nightMap,
        dayMap,
        dayMix
    );

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}