varying vec2 vUv;
varying float vWobble;

uniform vec3 uColorA;
uniform vec3 uColorB;

void main()
{
    csm_DiffuseColor.rgb = mix(uColorA, uColorB, vWobble);
}