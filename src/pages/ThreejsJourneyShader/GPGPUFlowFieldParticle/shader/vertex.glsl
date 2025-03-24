uniform float uSize;
uniform vec2 uResolution;
uniform sampler2D uParticleTexture;

varying vec3 vColor;

attribute vec2 aParticleUv;
attribute vec3 aColor;
attribute float aSize;

void main()
{
    vec4 particles = texture2D(uParticleTexture, aParticleUv);

    vec4 modelPosition = modelMatrix * vec4(particles.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    float sizeIn = smoothstep(0.0, 1.0, particles.a);
    float sizeOut = 1.0 - smoothstep(0.7, 1.0, particles.a);
    float size = min(sizeIn, sizeOut);

    // Point Size
    gl_PointSize = size * uSize * uResolution.y * aSize;
    gl_PointSize *= (1.0 / -viewPosition.z);

    // Varying
    vColor = aColor;
}