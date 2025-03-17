precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uEarthDayTexture;
uniform sampler2D uSpecularCloudsTexture;

uniform vec3 uSunDirection;


void main()
{
    vec2 uv = vUv;
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    // Base Color
    vec3 color = vec3(0.0);

    vec3 sunDirection = uSunDirection;
    float sunOrentation = dot(sunDirection, normal);

    vec4 earthDayColor = texture2D(uEarthDayTexture, uv);
    vec4 specularCloudsColor = texture2D(uSpecularCloudsTexture, uv);

    // Earth Color

    float dayMix = smoothstep(-0.25, 0.5, sunOrentation);

    // Specular
    vec3 reflection = reflect(-sunDirection, normal);
    float specular = dot(reflection, -viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, 20.0);
    specular *= specularCloudsColor.r;


    color = vec3(specular);


    // Final Color
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}