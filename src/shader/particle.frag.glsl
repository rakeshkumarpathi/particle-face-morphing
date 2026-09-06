varying float vAlpha;
varying float vMouthGlow;

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

    vec3 color =
        vec3(
            0.70,
            0.90,
            1.0
        );

    float mouthBoost =
        max(
            vMouthGlow,
            0.0
        ) * 0.8;

    alpha *=
        1.0 +
        mouthBoost;

    alpha *=
        0.85 *
        vAlpha;

    if (
        alpha < 0.01
    ) {
        discard;
    }

    gl_FragColor =
        vec4(
            color,
            alpha
        );
}