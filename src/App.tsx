import { useEffect, useRef } from "react";
import * as THREE from "three";

import { ParticleSystem } from "./three/ParticleSystem";

function App() {

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);


  useEffect(() => {

    if (!canvasRef.current) {
      return;
    }


    // =================================
    // SCENE
    // =================================

    const scene =
      new THREE.Scene();

    scene.background =
      new THREE.Color(0x000000);


    // =================================
    // CAMERA
    // =================================

    const camera =
      new THREE.PerspectiveCamera(
        45,
        window.innerWidth /
          window.innerHeight,
        0.1,
        100
      );

    camera.position.z = 10;


    // =================================
    // RENDERER
    // =================================

    const renderer =
      new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true
      });

    const pixelRatio =
      Math.min(
        window.devicePixelRatio,
        2
      );

    renderer.setPixelRatio(
      pixelRatio
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    // =================================
    // PARTICLES
    // =================================

    const particleCount =
      25000;

    const particles =
      new ParticleSystem(
        particleCount
      );

    scene.add(
      particles.points
    );


    // =================================
    // LOAD IMAGE
    // =================================

    const loadImage =
      (src: string) => {

        return new Promise<HTMLImageElement>(
          (
            resolve,
            reject
          ) => {

            const image =
              new Image();

            image.onload =
              () => resolve(image);

            image.onerror =
              () =>
                reject(
                  new Error(
                    `Could not load ${src}`
                  )
                );

            image.src =
              src;
          }
        );
      };


    // =================================
    // CREATE FACE TARGETS
    // =================================

    const createFaceTargets =
      async () => {

        console.log(
          "Loading face..."
        );


        const face =
          await loadImage(
            "/assets/face.png"
          );


        console.log(
          "Loading depth..."
        );


        const depth =
          await loadImage(
            "/assets/face-depth.png"
          );


        // =================================
        // FACE CANVAS
        // =================================

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          face.width;

        canvas.height =
          face.height;


        const context =
          canvas.getContext(
            "2d"
          );


        if (!context) {

          throw new Error(
            "Could not create face canvas context."
          );

        }


        context.drawImage(
          face,
          0,
          0
        );


        const facePixels =
          context.getImageData(
            0,
            0,
            face.width,
            face.height
          ).data;


        // =================================
        // DEPTH CANVAS
        // =================================

        const depthCanvas =
          document.createElement(
            "canvas"
          );

        depthCanvas.width =
          face.width;

        depthCanvas.height =
          face.height;


        const depthContext =
          depthCanvas.getContext(
            "2d"
          );


        if (!depthContext) {

          throw new Error(
            "Could not create depth canvas context."
          );

        }


        depthContext.drawImage(
          depth,
          0,
          0,
          face.width,
          face.height
        );


        const depthPixels =
          depthContext.getImageData(
            0,
            0,
            face.width,
            face.height
          ).data;


        // =================================
        // FACE CANDIDATES
        // =================================

        const candidates: {
          x: number;
          y: number;
          depth: number;
          weight: number;
          brightness: number;
        }[] = [];


        for (
          let y = 0;
          y < face.height;
          y += 2
        ) {

          for (
            let x = 0;
            x < face.width;
            x += 2
          ) {

            const index =
              (
                y *
                face.width +
                x
              ) * 4;


            // =================================
            // DEPTH
            // =================================

            const depthValue =
              depthPixels[index] /
              255;


            if (
              depthValue < 0.30
            ) {

              continue;

            }


            // =================================
            // BRIGHTNESS
            // =================================

            const r =
              facePixels[index];

            const g =
              facePixels[index + 1];

            const b =
              facePixels[index + 2];


            const brightness =
              (
                r * 0.299 +
                g * 0.587 +
                b * 0.114
              ) / 255;


            // Remove very dark background.

            if (
              brightness < 0.10
            ) {

              continue;

            }


            // =================================
            // LOCAL CONTRAST
            // =================================

            const sample = (
              sx: number,
              sy: number
            ) => {

              sx =
                Math.max(
                  0,
                  Math.min(
                    face.width - 1,
                    sx
                  )
                );


              sy =
                Math.max(
                  0,
                  Math.min(
                    face.height - 1,
                    sy
                  )
                );


              const sampleIndex =
                (
                  Math.floor(sy) *
                  face.width +
                  Math.floor(sx)
                ) * 4;


              return (
                facePixels[sampleIndex] *
                  0.299 +
                facePixels[sampleIndex + 1] *
                  0.587 +
                facePixels[sampleIndex + 2] *
                  0.114
              ) / 255;

            };


            const left =
              sample(
                x - 6,
                y
              );

            const right =
              sample(
                x + 6,
                y
              );

            const top =
              sample(
                x,
                y - 6
              );

            const bottom =
              sample(
                x,
                y + 6
              );


            const horizontalContrast =
              Math.abs(
                left - right
              );

            const verticalContrast =
              Math.abs(
                top - bottom
              );


            const contrast =
              Math.min(
                Math.pow(
                  horizontalContrast +
                  verticalContrast,
                  0.7
                ),
                1
              );


            // =================================
            // NORMALIZED IMAGE POSITION
            // =================================

            const nx =
              x /
              face.width;

            const ny =
              y /
              face.height;


            // =================================
            // EYE ZONES
            // =================================

            const leftEye =
              Math.exp(
                -(
                  Math.pow(
                    (nx - 0.36) /
                    0.12,
                    2
                  ) +
                  Math.pow(
                    (ny - 0.47) /
                    0.055,
                    2
                  )
                )
              );


            const rightEye =
              Math.exp(
                -(
                  Math.pow(
                    (nx - 0.64) /
                    0.12,
                    2
                  ) +
                  Math.pow(
                    (ny - 0.47) /
                    0.055,
                    2
                  )
                )
              );


            // =================================
            // NOSE ZONE
            // =================================

            const nose =
              Math.exp(
                -(
                  Math.pow(
                    (nx - 0.50) /
                    0.09,
                    2
                  ) +
                  Math.pow(
                    (ny - 0.58) /
                    0.13,
                    2
                  )
                )
              );


            // =================================
            // MOUTH ZONE
            // =================================

            const mouth =
              Math.exp(
                -(
                  Math.pow(
                    (nx - 0.50) /
                    0.16,
                    2
                  ) +
                  Math.pow(
                    (ny - 0.72) /
                    0.055,
                    2
                  )
                )
              );


            const featureZone =
              leftEye +
              rightEye +
              nose * 0.7 +
              mouth;


            // =================================
            // FEATURE WEIGHT
            // =================================

            const edgeStrength =
              Math.pow(
                contrast,
                2.0
              );


            const darkFeature =
              Math.pow(
                1.0 - brightness,
                3.0
              );


            const featureWeight =
              0.08 +
              edgeStrength * 38.0 +
              darkFeature * 5.0;


            candidates.push({
              x,
              y,
              depth: depthValue,
              weight:
                featureWeight +
                featureZone * 2.0,
              brightness
            });

          }

        }


        console.log(
          "Filtered face candidates:",
          candidates.length
        );


        // =================================
        // DEPTH NORMALIZATION
        // =================================

        let minDepth =
          Infinity;

        let maxDepth =
          -Infinity;


        for (
          const candidate
          of candidates
        ) {

          minDepth =
            Math.min(
              minDepth,
              candidate.depth
            );


          maxDepth =
            Math.max(
              maxDepth,
              candidate.depth
            );

        }


        const depthRange =
          Math.max(
            maxDepth -
            minDepth,
            0.0001
          );


        console.log(
          "Face depth range:",
          minDepth,
          maxDepth
        );


        // =================================
        // TARGET POSITIONS
        // =================================

        const targets =
          new Float32Array(
            particleCount * 3
          );


        // =================================
        // INTENSITY ATTRIBUTE
        // =================================

        const intensityAttribute =
          particles.points.geometry.getAttribute(
            "aIntensity"
          ) as THREE.BufferAttribute;


        const sizeAttribute =
          particles.points.geometry.getAttribute(
            "aSize"
          ) as THREE.BufferAttribute;


        // =================================
        // CREATE PARTICLES
        // =================================

        for (
          let i = 0;
          i < particleCount;
          i++
        ) {

          // ---------------------------------
          // WEIGHTED SAMPLING
          // ---------------------------------

          let candidate:
            {
              x: number;
              y: number;
              depth: number;
              weight: number;
              brightness: number;
            } | undefined;


          while (!candidate) {

            const randomCandidate =
              candidates[
                Math.floor(
                  Math.random() *
                  candidates.length
                )
              ];


            const probability =
              Math.min(
                randomCandidate.weight /
                12.0,
                1.0
              );


            if (
              Math.random() <
              probability
            ) {

              candidate =
                randomCandidate;

            }

          }


          // ---------------------------------
          // X
          // ---------------------------------

          const x =
            (
              candidate.x /
              face.width -
              0.5
            ) * 8.2;


          // ---------------------------------
          // Y
          // ---------------------------------

          const y =
            (
              0.5 -
              candidate.y /
              face.height
            ) * 8.2;


          // ---------------------------------
          // Z
          // ---------------------------------

          const normalizedDepth =
            (
              candidate.depth -
              minDepth
            ) /
            depthRange;


          const z =
            (
              normalizedDepth -
              0.5
            ) * 3.8;


          // ---------------------------------
          // WRITE POSITION
          // ---------------------------------

          const i3 =
            i * 3;


          targets[i3] =
            x;

          targets[i3 + 1] =
            y;

          targets[i3 + 2] =
            z;


          // ---------------------------------
          // WRITE IMAGE INTENSITY
          // ---------------------------------

          intensityAttribute.setX(
            i,
            candidate.brightness
          );


          // ---------------------------------
          // PARTICLE SIZE
          // ---------------------------------

          const featureSize =
            0.018 +
            Math.min(
              candidate.weight / 25.0,
              1.0
            ) * 0.035;


          sizeAttribute.setX(
            i,
            featureSize
          );

        }


        intensityAttribute.needsUpdate =
          true;

        sizeAttribute.needsUpdate =
          true;


        // =================================
        // SEND TARGETS
        // =================================

        particles.setTargets(
          targets
        );


        console.log(
          "Face targets ready."
        );


        // =================================
        // MORPH CLOUD → FACE
        // =================================

        const start =
          performance.now();


        const duration =
          2500;


        const morph =
          (
            now: number
          ) => {

            const elapsed =
              now - start;


            const rawProgress =
              Math.min(
                elapsed /
                duration,
                1
              );


            // Smooth ease-in-out
            const progress =
              rawProgress < 0.5
                ? 2.0 *
                  rawProgress *
                  rawProgress
                : 1.0 -
                  Math.pow(
                    -2.0 *
                    rawProgress +
                    2.0,
                    2.0
                  ) /
                  2.0;


            particles.setMorphProgress(
              progress
            );


            if (
              rawProgress < 1
            ) {

              requestAnimationFrame(
                morph
              );

            } else {

              particles.setMorphProgress(
                1
              );

            }

          };


        requestAnimationFrame(
          morph
        );

      };


    // =================================
    // START FACE SETUP
    // =================================

    createFaceTargets()
      .catch(
        (error) => {

          console.error(
            "FACE SETUP ERROR:",
            error
          );

        }
      );


    // =================================
    // ANIMATION
    // =================================

    const clock =
      new THREE.Clock();


    let animationFrameId:
      number;


    const animate =
      () => {

        const elapsed =
          clock.getElapsedTime();


        particles.update(
          elapsed
        );


        renderer.render(
          scene,
          camera
        );


        animationFrameId =
          requestAnimationFrame(
            animate
          );

      };


    animate();


    // =================================
    // RESIZE
    // =================================

    const handleResize =
      () => {

        camera.aspect =
          window.innerWidth /
          window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
          window.innerWidth,
          window.innerHeight
        );

      };


    window.addEventListener(
      "resize",
      handleResize
    );


    // =================================
    // CLEANUP
    // =================================

    return () => {

      cancelAnimationFrame(
        animationFrameId
      );


      window.removeEventListener(
        "resize",
        handleResize
      );


      particles.dispose();


      renderer.dispose();

    };

  }, []);


  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100vw",
        height: "100vh"
      }}
    />
  );

}


export default App;