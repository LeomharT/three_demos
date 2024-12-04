uniform float u_gravity;

varying vec2 v_uv;

void main(){
    v_uv = uv;
    
    vec2 center = vec2(0.5, 0.5);

    float gravity = u_gravity;

    float distanceToCenter = distance(uv, center);

    float displacement = gravity * pow(distanceToCenter, 2.0);

    vec3 displacePosition = vec3(
        position.x ,
        position.y + displacement, 
        position.z
    );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacePosition, 1.0);
}