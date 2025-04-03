uniform float uSize;
uniform float uTime;
uniform vec2 uResolution;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float angle = atan(modelPosition.y, modelPosition.x);
    modelPosition.y = sin(angle + uTime * 0.5);
    modelPosition.x = cos(angle + uTime * 0.5);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionMatrix = projectionMatrix * viewPosition;



    gl_Position = projectionMatrix;

    gl_PointSize = uSize * uResolution.y;
}