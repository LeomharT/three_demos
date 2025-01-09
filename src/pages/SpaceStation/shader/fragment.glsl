uniform float opacity;

uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    vec2 offset = vec2(0.001, 0.001);

 
    float r = texture2D( tDiffuse, vUv).r;
    float g = texture2D( tDiffuse, vUv + offset).g;
    float b = texture2D( tDiffuse, vUv - offset ).b;

    vec3 color = vec3(r,g,b);

	gl_FragColor = vec4(color, opacity);
}