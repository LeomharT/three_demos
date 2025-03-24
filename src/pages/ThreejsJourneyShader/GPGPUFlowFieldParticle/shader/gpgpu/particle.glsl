#include <simplex4DNoise>

uniform float uTime;
uniform float uDeltaTime;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;
uniform sampler2D uBase;

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float time = uTime * 0.2;

    vec4 particle = texture2D(uParticle, uv);
    vec4 base = texture2D(uBase, uv);

    if(particle.a >= 1.0)
    {
        particle.a = fract(particle.a);
        particle.xyz = base.xyz;
    }else{
        // Strength
        float strength = snoise(vec4(base.xyz * 0.2, time + 1.0));
        float influence = (uFlowFieldInfluence - 0.5) * -2.0;
        strength = smoothstep(influence, 1.0, strength);
        
        // Flow Field
        vec3 flowField = vec3(
            snoise(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
            snoise(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
            snoise(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
        );
        flowField = normalize(flowField);
        particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;

        // Decay
        particle.a += uDeltaTime * 0.3;
    }

    gl_FragColor = particle;
}