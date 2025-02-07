
uniform vec4 projectionMatrix;
uniform vec4 modelMatrix;
uniform vec4 viewMatrix;

attribute vec3 position;


void main()
{
    gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);
}