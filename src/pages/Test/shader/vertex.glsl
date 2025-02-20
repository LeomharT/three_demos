uniform float uTime;
uniform float uSize;

varying vec3 vColor; 

void main()
{
    vec3 displacementPosition = position;

    float angle = atan(displacementPosition.x, displacementPosition.z);
    float distanceToCenter = length(displacementPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime; 

    angle += angleOffset;

    displacementPosition.x = cos(angle) * distanceToCenter;
    displacementPosition.z = sin(angle) * distanceToCenter;
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacementPosition, 1.0);

    gl_PointSize = uSize;

    vColor = color;
}