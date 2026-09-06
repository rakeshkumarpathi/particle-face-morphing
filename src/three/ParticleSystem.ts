import * as THREE from "three";

import vertexShader from "../shader/particle.vert.glsl?raw";
import fragmentShader from "../shader/particle.frag.glsl?raw";

export class ParticleSystem {

  points: THREE.Points;

  material: THREE.ShaderMaterial;


  constructor(
    count: number = 25000
  ) {

    // =================================
    // SHADER MATERIAL
    // =================================

    this.material =
      new THREE.ShaderMaterial({

        vertexShader,

        fragmentShader,

        transparent: true,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        uniforms: {

          // Animation time
          uTime: {
            value: 0
          },

          // Face morph progress
          uMorphProgress: {
            value: 0
          },

          // Talk button state
          // 0 = still
          // 1 = talking
          uTalk: {
            value: 0
          }

        }

      });


    // =================================
    // GEOMETRY
    // =================================

    const geometry =
      new THREE.BufferGeometry();


    // =================================
    // START POSITIONS
    // =================================

    const positions =
      new Float32Array(
        count * 3
      );


    // =================================
    // FACE TARGET POSITIONS
    // =================================

    const targets =
      new Float32Array(
        count * 3
      );


    // =================================
    // PARTICLE ATTRIBUTES
    // =================================

    const sizes =
      new Float32Array(count);

    const randoms =
      new Float32Array(count);

    const intensities =
      new Float32Array(count);


    // =================================
    // CREATE INITIAL CLOUD
    // =================================

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const i3 =
        i * 3;


      const radius =
        Math.pow(
          Math.random(),
          0.7
        ) * 4;


      const theta =
        Math.random() *
        Math.PI *
        2;


      const phi =
        Math.acos(
          2 *
          Math.random() -
          1
        );


      positions[i3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);


      positions[i3 + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);


      positions[i3 + 2] =
        radius *
        Math.cos(phi) *
        0.5;


      sizes[i] =
        0.015 +
        Math.random() *
        0.035;


      randoms[i] =
        Math.random();

    }


    // =================================
    // GEOMETRY ATTRIBUTES
    // =================================

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );


    geometry.setAttribute(
      "aTarget",
      new THREE.BufferAttribute(
        targets,
        3
      )
    );


    geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(
        sizes,
        1
      )
    );


    geometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(
        randoms,
        1
      )
    );


    geometry.setAttribute(
      "aIntensity",
      new THREE.BufferAttribute(
        intensities,
        1
      )
    );


    // =================================
    // POINTS
    // =================================

    this.points =
      new THREE.Points(
        geometry,
        this.material
      );

  }


  // =================================
  // UPDATE TIME
  // =================================

  update(
    time: number
  ) {

    this.material.uniforms
      .uTime.value =
      time;

  }


  // =================================
  // SET MORPH PROGRESS
  // =================================

  setMorphProgress(
    progress: number
  ) {

    this.material.uniforms
      .uMorphProgress.value =
      progress;

  }


  // =================================
  // TALK CONTROL
  // =================================
  //
  // false = face stays still
  // true  = mouth starts talking
  //

  setTalk(
    talking: boolean
  ) {

    this.material.uniforms
      .uTalk.value =
      talking
        ? 1.0
        : 0.0;

  }


  // =================================
  // SET FACE TARGETS
  // =================================

  setTargets(
    targets: Float32Array
  ) {

    const attribute =
      this.points.geometry
        .getAttribute(
          "aTarget"
        ) as THREE.BufferAttribute;


    attribute.array =
      targets;

    attribute.needsUpdate =
      true;

  }


  // =================================
  // DISPOSE
  // =================================

  dispose() {

    this.points.geometry.dispose();

    this.material.dispose();

  }

}