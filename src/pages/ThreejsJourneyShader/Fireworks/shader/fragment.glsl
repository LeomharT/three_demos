uniform sampler2D uTexture;
uniform vec3 uColor;

void main()
{
    vec4 color = texture2D(uTexture, gl_PointCoord);

    gl_FragColor = vec4(uColor, color.r);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}