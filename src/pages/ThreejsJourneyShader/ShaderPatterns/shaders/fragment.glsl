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

    float barX = step(0.4, fract(uv.x * 10.0));
    barX *= step(0.8, fract(uv.y * 10.0 + 0.2));

    float barY = step(0.8, fract(uv.x * 10.0 + 0.2));
    barY *= step(0.4, fract(uv.y * 10.0));

    float strength = step(0.2,min( abs(0.5 - uv.y) , abs(0.5 - uv.x)));

    gl_FragColor = vec4(vec3(ceil(uv.x * 10.0) / 10.0), 1.0);
}