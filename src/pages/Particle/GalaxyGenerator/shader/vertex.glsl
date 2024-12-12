void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(potision, 1.0);
}