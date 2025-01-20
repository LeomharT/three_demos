uniform float opacity;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    vec4 diffuse = texture2D(tDiffuse, vUv);
    
	vec4 color = vec4(diffuse.rgb, opacity);

	gl_FragColor = color;
}