uniform float uTime;
uniform float uMorphProgress;
uniform float uTalk;

attribute float aSize;
attribute float aRandom;
attribute vec3 aTarget;

varying float vAlpha;
varying float vMouthGlow;

void main()
{
    float progress =
        smoothstep(
            0.0,
            1.0,
            uMorphProgress
        );

    vec3 finalPosition =
        mix(
            position,
            aTarget,
            progress
        );

    float faceIdle =
        smoothstep(
            0.75,
            1.0,
            progress
        );

    float mouthY =
        0.6 -
        smoothstep(
            -2.7,
            -2.0,
            aTarget.y
        );

    float mouthWidth =
        1.0 -
        smoothstep(
            0.15,
            3.0,
            abs(aTarget.x)
        );

    float mouthRegion =
        mouthY *
        mouthWidth;

    float mouthVerticalGlow =
        exp(
            -pow(
                (aTarget.y + 2.15) / 0.18,
                2.0
            )
        );

    float mouthHorizontalGlow =
        1.0 -
        smoothstep(
            0.15,
            1.5,
            abs(aTarget.x)
        );

    float mouthGlow =
        mouthVerticalGlow *
        mouthHorizontalGlow;

    vMouthGlow =
        mouthGlow *
        faceIdle;

    float lipOpen =
        sin(
            uTime * 6.0
        );

    float lipDetail =
        sin(
            uTime * 9.0 +
            aRandom * 15.0
        );

    float lipMovement =
        (
            lipOpen * 0.035 +
            lipDetail * 0.008
        )
        *
        mouthRegion
        *
        faceIdle
        *
        uTalk;

    finalPosition.y +=
        lipMovement;

    float horizontalLipMovement =
        sin(
            uTime * 5.0 +
            aRandom * 10.0
        )
        *
        0.004
        *
        mouthRegion
        *
        faceIdle
        *
        uTalk;

    finalPosition.x +=
        horizontalLipMovement;

    float cloudAmount =
        1.0 -
        progress;

    finalPosition.x +=
        sin(
            uTime * 0.7 +
            aRandom * 10.0
        )
        *
        0.08
        *
        cloudAmount;

    finalPosition.y +=
        cos(
            uTime * 0.6 +
            aRandom * 12.0
        )
        *
        0.08
        *
        cloudAmount;

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
        )
        *
        0.010 *
        faceIdle;

    finalPosition.z +=
        sin(
            uTime * 0.6 +
            aRandom * 13.0
        )
        *
        0.018 *
        faceIdle;

    vec4 modelPosition =
        modelMatrix *
        vec4(
            finalPosition,
            1.0
        );

    vec4 viewPosition =
        viewMatrix *
        modelPosition;

    gl_Position =
        projectionMatrix *
        viewPosition;

    float sizeBoost =
        1.85;
    
    gl_PointSize =
        aSize *
        sizeBoost *
        (560.0 / -viewPosition.z);
        
    vAlpha =
        0.75 +
        aRandom * 0.25;
}