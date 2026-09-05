uniform float uTime;
uniform float uMorphProgress;

attribute float aSize;
attribute float aRandom;
attribute vec3 aTarget;
attribute float aIntensity;

varying float vIntensity;

varying float vAlpha;
varying vec3 vColor;


void main()
{
   
    // -------------------------
    // Morph cloud → face
    // -------------------------

    float progress = smoothstep(
        0.0,
        1.0,
        uMorphProgress
    );

    vec3 finalPosition = mix(
        position,
        aTarget,
        progress
    );


    // -------------------------
    // Cloud movement
    // -------------------------

    float cloudAmount =
        1.0 - progress;

    finalPosition.x +=
        sin(
            uTime * 0.7 +
            aRandom * 10.0
        )
        * 0.08
        * cloudAmount;

    finalPosition.y +=
        cos(
            uTime * 0.6 +
            aRandom * 12.0
        )
        * 0.08
        * cloudAmount;


    // -------------------------
    // Subtle face movement
    // -------------------------

float faceIdle =
    smoothstep(
        0.75,
        1.0,
        progress
    );

float microMotion =
    sin(
        uTime * 0.7 +
        aRandom * 20.0
    );

finalPosition.x +=
    microMotion *
    0.012 *
    faceIdle;

finalPosition.y +=
    cos(
        uTime * 0.55 +
        aRandom * 17.0
    ) *
    0.010 *
    faceIdle;

finalPosition.z +=
    sin(
        uTime * 0.6 +
        aRandom * 13.0
    ) *
    0.018 *
    faceIdle;


    // -------------------------
    // Projection
    // -------------------------

    vec4 modelPosition =
        modelMatrix *
        vec4(finalPosition, 1.0);

    vec4 viewPosition =
        viewMatrix *
        modelPosition;

    gl_Position =
        projectionMatrix *
        viewPosition;


    // -------------------------
    // Particle size
    // -------------------------

    float sizeBoost =
    mix(
        0.85,
        1.25,
        progress
    );

    gl_PointSize =
        aSize *
        sizeBoost *
        (560.0 / -viewPosition.z);


    // -------------------------
    // Values sent to fragment
    // -------------------------

    vAlpha =
        0.75 +
        aRandom * 0.25;

    vColor =
        vec3(1.0);

    vIntensity = aIntensity;
}