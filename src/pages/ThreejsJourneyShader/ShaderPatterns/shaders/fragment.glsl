precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture;

void main()
{
    vec2 uv = vUv;

    vec4 alphaMap = texture2D(uTexture, uv);

    float radius = 0.5;
    
    vec2 center = vec2(0.5, 0.5);

    float distanceToCenter = distance(uv, center);

    vec4 color = vec4(uv.x, uv.y, 0.0, alphaMap.a);

    vec4 patterns = vec4(vec3(fract(uv.y * 10.0)), 1.0);
    patterns = step(0.5, patterns);

    vec4 patterns2 = vec4(vec3(fract(uv.x * 10.0)), 1.0);
    patterns2 = step(0.5, patterns2) * patterns;



    gl_FragColor = patterns2;
}