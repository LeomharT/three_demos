varying vec2 v_uv;
varying vec3 v_worldPosition;

void main()
{
    v_uv = uv;
 
    vec4 worldPosition = projectionMatrix * vec4(position, 1.0);
    v_worldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}