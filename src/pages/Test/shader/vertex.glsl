varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // modelMatrix 应用旋转
    // 1.0 0.0 作用是否应用平移 w = 1.0 使顶点受平移影响； w = 0.0 则不会受平移影响（适用于法向量或方向向量）。
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}