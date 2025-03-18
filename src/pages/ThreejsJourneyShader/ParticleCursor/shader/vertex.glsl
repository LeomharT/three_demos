precision mediump float;

uniform vec2 uResolution;

uniform float uPointSize;
uniform float uIntensityRemapEdge;

uniform sampler2D uTexture;
uniform sampler2D uCanvasTexture;

varying vec2 vUv;
varying vec3 vColor;

attribute float aIntensity;
attribute float aAngle;

void main()
{
    // Displacement
    vec3 displacementPosition = position;
    float displacementIntensity = texture2D(uCanvasTexture, uv).r;

    // Remap Intensity
    displacementIntensity = smoothstep(
        0.1, 
        uIntensityRemapEdge, 
        displacementIntensity
    );

    vec3 displacement = vec3(
        cos(aAngle) * 0.2,
        sin(aAngle) * 0.2,
        1.0
    );

    displacement = normalize(displacement);
    displacement *= displacementIntensity;
    displacement *= 3.0;
    displacement *= aIntensity;
 
    displacementPosition += displacement;

    vec4 modelPosition = modelMatrix * vec4(displacementPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    float pictureIntensity = texture2D(uTexture, uv).r;

    gl_Position = projectionPosition;

    gl_PointSize = uPointSize * uResolution.y * pictureIntensity;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vUv = uv;
    vColor = vec3(pow(pictureIntensity, 2.0));
}