varying vec2 vUv;

void main()
{
    vUv = uv;

    float gravity = 1.807;

    float radius = 0.35;

    vec2 center = vec2(0.5, 0.5);

    float distanceToCenter = distance(uv, center);

    float displacement = gravity * pow(distanceToCenter, 1.65);

    vec3 displacementPosition = vec3(
        position.x,
        position.y,
        position.z
    );


    if(distanceToCenter < radius)
    {
        displacementPosition.y += displacement;
    }
    if(distanceToCenter > radius)
    {

    }
    

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacementPosition, 1.0);
}