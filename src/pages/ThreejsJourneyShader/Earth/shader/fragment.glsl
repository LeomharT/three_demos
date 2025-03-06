varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform sampler2D uDayMapTexture;
uniform sampler2D uNightMapTexture;
uniform vec3 uSunDirection;

void main()
{
    vec2 uv = vUv;
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation
    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);

    vec3 dayColor = texture2D(uDayMapTexture, uv).rgb;
    vec3 nightColor = texture2D(uNightMapTexture, uv).rgb;

    color = mix(
        nightColor,
        dayColor,
        dayMix
    );

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}