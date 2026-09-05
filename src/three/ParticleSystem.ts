import * as THREE from "three";

import vertexShader from "../shader/particle.vert.glsl?raw";
import fragmentShader from "../shader/particle.frag.glsl?raw";

export class ParticleSystem {

  points: THREE.Points;

  material: THREE.ShaderMaterial;


  constructor(
    count: number = 25000
  ) {

    this.material =
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,

      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,

      uniforms: {
        uTime: { value: 0 },
        uDissolve: { value: 0 }
      }
      });

    const geometry =
      new THREE.BufferGeometry();


    // --------------------------------
    // START POSITIONS
    // --------------------------------

    const positions =
      new Float32Array(
        count * 3
      );


    // --------------------------------
    // FACE TARGET POSITIONS
    // --------------------------------

    const targets =
      new Float32Array(
        count * 3
      );


    const sizes =
      new Float32Array(count);

    const randoms =
      new Float32Array(count);


    // --------------------------------
    // Create initial cloud
    // --------------------------------

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const i3 = i * 3;


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


    // --------------------------------
    // Geometry
    // --------------------------------

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

    const intensities = new Float32Array(count);
    geometry.setAttribute(
      "aIntensity",
      new THREE.BufferAttribute(
        intensities,
        1
      )
    );



    // --------------------------------
    // Shader material
    // --------------------------------

    this.material =
      new THREE.ShaderMaterial({

        vertexShader,

        fragmentShader,

        transparent: true,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        uniforms: {

          uTime: {
            value: 0
          },

          uMorphProgress: {
            value: 0
          }

        }

      });


    // --------------------------------
    // Points
    // --------------------------------

    this.points =
      new THREE.Points(
        geometry,
        this.material
      );
  }

  update(time: number) {
    this.material.uniforms.uTime.value = time;
  }
  
  setDissolve(progress: number) {
    this.material.uniforms.uDissolve.value = progress;
  }


  // --------------------------------
  // Set face targets
  // --------------------------------

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



  // --------------------------------
  // Morph
  // --------------------------------

  setMorphProgress(
    progress: number
  ) {

    this.material.uniforms
      .uMorphProgress.value =
      progress;
  }


  // --------------------------------
  // Dispose
  // --------------------------------

  dispose() {

    this.points.geometry.dispose();

    this.material.dispose();
  }

}