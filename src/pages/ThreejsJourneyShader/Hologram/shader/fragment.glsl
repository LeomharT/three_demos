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
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Holographic
    float holographic = fresnel * stripes;
    holographic += fresnel * 1.25;

   
    
    gl_FragColor = vec4(uColor, holographic);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}