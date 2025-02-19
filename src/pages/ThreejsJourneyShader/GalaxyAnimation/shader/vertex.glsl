uniform float uSize;
uniform float uTime;

attribute float aScales;
attribute vec3 aRandomness;

varying vec3 vColor;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

 
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.5;
    angle += angleOffset;

    modelPosition.x = cos(angle) * distanceToCenter; 
    modelPosition.z = sin(angle) * distanceToCenter;

    modelPosition.xyz += aRandomness.xyz;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectionPosition;

    gl_PointSize = uSize * aScales;
    // Size Attenuation
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = color;
}