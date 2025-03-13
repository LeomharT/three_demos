uniform vec2 uResolution;
uniform float uPointSize;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vColor;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    float pictureIntensity = texture2D(uTexture, uv).r;

    gl_Position = projectionPosition;

    gl_PointSize = uPointSize * uResolution.y * pictureIntensity;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vUv = uv;
    vColor = vec3(pow(pictureIntensity, 2.0));
}