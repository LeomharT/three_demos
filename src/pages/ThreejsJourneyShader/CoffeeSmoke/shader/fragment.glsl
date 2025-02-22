uniform sampler2D uNoiseTexture;
uniform float uTime;

varying vec2 vUv;


void main()
{
    vec2 smokeUV = vUv;

    smokeUV.x *= 0.5;
    smokeUV.y *= 0.3;

    smokeUV.y -= uTime * 0.232;

    float smoke = texture2D(uNoiseTexture, smokeUV).r;
    smoke = smoothstep(0.4, 1.0,  smoke);
    
    // Edge
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(0.0,0.1, vUv.y);
    smoke *= smoothstep(1.0,0.4, vUv.y);

    gl_FragColor = vec4(0.6, 0.3 ,0.2, smoke);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}