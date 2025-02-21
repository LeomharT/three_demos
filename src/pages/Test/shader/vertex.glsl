uniform float uTime;
uniform float uSize;

varying vec3 vColor; 

attribute float aRandom;

void main()
{
    vec3 displacementPosition = position;

    float angle = atan(displacementPosition.x, displacementPosition.z);
    float distanceToCenter = length(displacementPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 10.0 * aRandom; 

    angle += angleOffset;

    displacementPosition.x = cos(angle);
    displacementPosition.y = 0.5 - sin(aRandom);
    displacementPosition.z = sin(angle);
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacementPosition, 1.0);

    gl_PointSize = uSize;

    vColor = color;
}