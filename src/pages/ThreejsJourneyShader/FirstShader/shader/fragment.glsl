precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uColor;
 
varying vec2 vUv;
varying float vElevation;

void main()
{   
    vec4 color = texture2D(uTexture,vUv);

    color.rgb *= vElevation * 2.0 + 0.5;
 
    gl_FragColor = color;
}