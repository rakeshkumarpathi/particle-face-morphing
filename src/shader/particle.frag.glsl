varying float vAlpha;
varying float vIntensity;



void main()
{
    vec2 uv =
        gl_PointCoord -
        vec2(0.5);

    float distanceFromCenter =
        length(uv);

    float core =
        1.0 -
        smoothstep(
            0.05,
            0.32,
            distanceFromCenter
        );

    float glow =
        1.0 -
        smoothstep(
            0.15,
            0.5,
            distanceFromCenter
        );

    float alpha =
        core * 0.85 +
        glow * 0.25;

    if (alpha < 0.01) {
        discard;
    }

    vec3 color =
        vec3(
            0.70,
            0.90,
            1.0
        );
    
    gl_FragColor =
        vec4(
            color,
            alpha *
            0.85 *
            vAlpha
        );
}