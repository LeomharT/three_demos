#define PI 3.14159265358932384

precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
        cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
        cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

float cnoise(vec2 P){
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * 
        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}


void main()
{
    vec2 uv = vUv;

    vec4 alphaMap = texture2D(uTexture, uv);

    float radius = 0.5;
    
    vec2 center = vec2(0.5, 0.5);

    float distanceToCenter = distance(uv, center);

    vec4 color = vec4(uv.x, uv.y, 0.0, alphaMap.a);

    float strength11 = step(0.8, fract(uv.x * 10.0));
    strength11 += step(0.8, fract(uv.y * 10.0));

    float barX = step(0.4, fract(uv.x * 10.0));
    barX *= step(0.8, fract(uv.y * 10.0 + 0.2));

    float barY = step(0.8, fract(uv.x * 10.0 + 0.2));
    barY *= step(0.4, fract(uv.y * 10.0));

    float strength = step(0.2,min( abs(0.5 - uv.y) , abs(0.5 - uv.x)));

    float strength22 = floor(uv.x * 10.0) / 10.0;
    strength22 *= floor(uv.y * 10.0) / 10.0;

    float strength23 = random(uv);

    vec2 gridUV = vec2(
        floor(uv.x * 10.0) / 10.0,
        floor(uv.y * 10.0) / 10.0
    );
    float strength24 = random(gridUV);

    vec2 offsetGridUV = vec2(
        floor(uv.x * 10.0) / 10.0,
        floor(uv.y * 10.0 + uv.x * 5.0) / 10.0
    );
    float strength25 = random(offsetGridUV);

    float strength26 = length(uv - 0.5);

    float strength27 = length(distance(uv, vec2(0.5)));

    float strength28 = 1.0 - length(uv - 0.5);

    float strength29 = 0.015 / length(uv - 0.5);

    vec2 lightUV = vec2(
        uv.x * 0.1 + 0.45,
        uv.y * 0.5 + 0.25
     );
    float strength30 = 0.015 / length(lightUV - 0.5);

    vec2 rotateUV = rotate(uv, PI / 4.0, vec2(0.5));
    
    vec2 lightUVX = vec2(rotateUV.x * 0.1 + 0.45, rotateUV.y * 0.5 + 0.25);
    float lightX = 0.015 / length(lightUVX - 0.5);

    vec2 lightUVY = vec2(rotateUV.x * 0.5 + 0.25, rotateUV.y * 0.1 + 0.45);
    float lightY = 0.015 / length(lightUVY - 0.5);

    float strength31 = lightX * lightY;
    // strength32 is rotated     

    float strength33 = step(0.25, distance(uv, vec2(0.5))); 

    float strength34 = abs(distance(uv, vec2(0.5)) - 0.25); 

    float strength35 = step(0.01, abs(distance(uv, vec2(0.5)) - 0.25)); 

    float strength36 = 1.0 - step(0.01, abs(distance(uv, vec2(0.5)) - 0.25)); 

    vec2 waveUV = vec2(
        uv.x + sin(uv.y * 130.0) * 0.1,
        uv.y + sin(uv.x * 130.0) * 0.1
    );
    float strength37 = 1.0 - step(0.01, abs(distance(waveUV, vec2(0.5)) - 0.25)); 

    float strength38 = 1.0 - step(0.01, abs(distance(waveUV, vec2(0.5)) - 0.25)); 

    float strength39 = 1.0 - step(0.01, abs(distance(waveUV, vec2(0.5)) - 0.25)); 

    float strength40 = atan(uv.x, uv.y);

    float strength41 = atan(uv.x - 0.5, uv.y - 0.5);

    float angle = atan(uv.x - 0.5, uv.y - 0.5);
    angle /= PI * 2.0;
    angle += 0.5;

    float strength42 = angle;

    float strength43 = fract(angle * 20.0);

    float strength44 = sin(angle * 150.0);

    float radius45 = 0.25 + strength44 * 0.02;
    float strength45 = 1.0 - step(0.01, abs(distance(uv, vec2(0.5)) - radius45));

    float strength46 = cnoise(uv * 10.0);

    float strength47 = step(0.0, cnoise(uv * 10.0));

    float strength48 = 1.0 - abs(cnoise(uv * 10.0));

    float strength49 = sin(cnoise(uv * 10.0) * 20.0);

    float strength50 = step(0.9, sin(cnoise(uv * 10.0) * 20.0));
 
    gl_FragColor = vec4(vec3(uv, 1.0), strength11);
}