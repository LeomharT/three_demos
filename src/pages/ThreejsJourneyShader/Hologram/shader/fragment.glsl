uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main(void)
{
    vec2 uv = vUv;

    vec3 normal = normalize(vNormal);

    if(!gl_FrontFacing)
    {
        normal *= -1.0;
    }

    // Stripes
    float stripes = (vPosition.y - uTime) * 20.0;
    stripes = fract(stripes);
    stripes = pow(stripes, 3.0);

    // Fresnel
    // Normal length
    // Camera direction to vertex point
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    // Same Direction = 1.0
    // Perpendicular = 0.0
    // Opposite = -1.0
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Falloff
    float falloff = smoothstep(0.8, 0.0, fresnel);

    // Holographic
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;

    vec3 mixColor = mix(
        vec3(1.0, 0.1, 0.1),
        uColor,
        fresnel
    );
   
    gl_FragColor = vec4(mixColor, holographic);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}