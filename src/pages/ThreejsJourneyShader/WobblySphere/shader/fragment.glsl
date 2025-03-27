varying vec2 vUv;
varying float vWobble;

uniform vec3 uColorA;
uniform vec3 uColorB;

void main()
{
    float mixColor = smoothstep(-1.0, 1.0, vWobble);

    csm_DiffuseColor.rgb = mix(uColorA, uColorB, mixColor);

    // Mirror step 
    // csm_Metalness = step(0.25, vWobble);
    // csm_Roughness = 1.0 - csm_Metalness;

    csm_Roughness = 1.0 - mixColor;
}