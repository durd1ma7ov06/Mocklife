import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Foxy3DModelProps {
  status: 'idle' | 'listening' | 'speaking' | 'evaluating';
  size?: number; // Size in px
}

export const Foxy3DModel: React.FC<Foxy3DModelProps> = ({
  status,
  size = 240,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    // Positioned for perfect framing of head & bust
    camera.position.set(0, 0.05, 3.4);

    // 2. RENDERER (Crisp anti-aliasing, transparent background)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. WARM STUDIO LIGHTING
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.35);
    scene.add(ambientLight);

    // Key Light (Upper Front-Right, warm white)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3, 4, 3.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light (Front-Left, soft sky blue for rich contrast)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    fillLight.position.set(-3.5, 1.5, 2.5);
    scene.add(fillLight);

    // Rim Light (Back-Right, vibrant amber-orange edge backlight)
    const rimLight = new THREE.PointLight(0xff7700, 3.8, 12);
    rimLight.position.set(2, 2.5, -2);
    scene.add(rimLight);

    // Under-chin Bounce Light (Prevents muddy shadows)
    const bounceLight = new THREE.DirectionalLight(0xffedd5, 0.85);
    bounceLight.position.set(0, -2.5, 2);
    scene.add(bounceLight);

    // Dynamic Speaking Light Pulse
    const speakingBackdropLight = new THREE.PointLight(0xff6600, 0, 8);
    speakingBackdropLight.position.set(0, 0, 1.2);
    scene.add(speakingBackdropLight);

    // 4. INTERACTIVE DRAG & MOUSE ROTATION
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let userRotationY = 0;
    let userRotationX = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = Math.max(-1, Math.min(1, x));
      mouseY = Math.max(-1, Math.min(1, y));

      if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        userRotationY += deltaX * 0.015;
        userRotationX += deltaY * 0.01;
        userRotationX = Math.max(-0.4, Math.min(0.4, userRotationX));
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousedown', onMouseDown);

    // 5. ROOT PIVOT RIG
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Head Rig Pivot Group
    const headRigGroup = new THREE.Group();
    rootGroup.add(headRigGroup);

    let mouthMesh: THREE.Object3D | null = null;
    let earMesh: THREE.Object3D | null = null;
    let loadedModel: THREE.Object3D | null = null;
    let baseHeadY = 0;

    // 6. LOAD AND ENHANCE CUTE_FOX.GLB
    const loader = new GLTFLoader();
    loader.load(
      '/cute_fox.glb',
      (gltf) => {
        loadedModel = gltf.scene;

        // Process meshes: smooth normals, deep vibrant orange fur, and animation targets
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Target mouth/lower jaw
            if (mesh.name === 'Object_13') {
              mouthMesh = mesh;
            }
            // Target ears
            if (mesh.name === 'Object_9') {
              earMesh = mesh;
            }
            // Hide bulky flat ground base plate for clean avatar presentation
            if (mesh.name === 'Object_25') {
              mesh.visible = false;
            }

            // 1. RECOMPUTE NORMALS FOR BUTTERY SMOOTH SURFACES (NO FACETS / NO LINES)
            if (mesh.geometry) {
              mesh.geometry.computeVertexNormals();
            }

            // 2. RECOLOR TO UNMISTAKABLE TRUE FOX ORANGE (#ff4700) WITH SEAMLESS BLEND
            if (mesh.geometry && mesh.geometry.attributes.color) {
              const colorAttr = mesh.geometry.attributes.color;
              for (let i = 0; i < colorAttr.count; i++) {
                const r = colorAttr.getX(i);
                const g = colorAttr.getY(i);
                const b = colorAttr.getZ(i);

                // Dark features (eyes, nose button, mouth)
                if (r < 0.45 && g < 0.22 && b < 0.22) {
                  colorAttr.setXYZ(i, 0.1, 0.05, 0.05);
                }
                // Deep Orange Fur and Soft White Cheeks/Muzzle
                else {
                  // Whiteness factor based on original blue channel
                  const whiteness = Math.max(0, Math.min(1, (b - 0.52) / 0.28));

                  // Unmistakable deep, rich, saturated Pixar Fox Orange (#ff4700):
                  const furR = 1.0;
                  const furG = 0.28; // Pure deep saturated orange!
                  const furB = 0.0;

                  // Soft cream-white for cheeks & muzzle:
                  const whiteR = 1.0;
                  const whiteG = 0.96;
                  const whiteB = 0.92;

                  // Smooth seamless blend
                  const finalR = furR * (1 - whiteness) + whiteR * whiteness;
                  const finalG = furG * (1 - whiteness) + whiteG * whiteness;
                  const finalB = furB * (1 - whiteness) + whiteB * whiteness;

                  colorAttr.setXYZ(i, finalR, finalG, finalB);
                }
              }
              colorAttr.needsUpdate = true;
            }

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.color.setHex(0xffffff);
              mat.vertexColors = true;
              mat.roughness = 0.4;
              mat.metalness = 0.0;
              mat.flatShading = false;
              mat.needsUpdate = true;
            }
          }
        });

        // 7. PERFECT HEAD & BUST FRAMING (No cut off, comfortable margins)
        const targetScale = 0.62;
        loadedModel.scale.set(targetScale, targetScale, targetScale);
        baseHeadY = -1.42 * targetScale - 0.05;
        loadedModel.position.set(0, baseHeadY, -0.11 * targetScale);

        headRigGroup.add(loadedModel);
      },
      undefined,
      (err) => {
        console.error('Error loading cute_fox.glb:', err);
      }
    );

    // 8. ANIMATION LOOP (LIVELY TALKING MOUTH, HEAD NODS, EAR TWITCHES, AURA GLOW)
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentStatus = statusRef.current;

      // 1. Smooth Idle Breathing Float
      rootGroup.position.y = Math.sin(time * 2.2) * 0.035;

      // 2. Interactive Cursor Tracking + Drag Rotation
      const targetLookY = mouseX * 0.35 + userRotationY;
      const targetLookX = -mouseY * 0.2 + userRotationX;
      rootGroup.rotation.y += (targetLookY - rootGroup.rotation.y) * 0.08;
      rootGroup.rotation.x += (targetLookX - rootGroup.rotation.x) * 0.08;

      // 3. Dynamic Speaking Backdrop Light Pulse
      if (currentStatus === 'speaking') {
        speakingBackdropLight.intensity = 3.2 + Math.sin(time * 14) * 1.6;
        rimLight.intensity = 4.2 + Math.sin(time * 10) * 1.2;
      } else if (currentStatus === 'listening') {
        speakingBackdropLight.intensity = 0.8;
        speakingBackdropLight.color.setHex(0x00e5ff); // Cyan listening glow
        rimLight.intensity = 3.2;
      } else {
        speakingBackdropLight.intensity = 0;
        speakingBackdropLight.color.setHex(0xff6600);
        rimLight.intensity = 3.2;
      }

      // 4. REAL TALKING MOUTH & LIVELY EXPRESSIONS
      if (loadedModel) {
        if (currentStatus === 'speaking') {
          // VISIBLY OPEN AND CLOSE MOUTH / JAW TO SPEECH CADENCE
          const speakCycle = Math.sin(time * 15);
          const mouthOpen = Math.max(0, speakCycle);

          if (mouthMesh) {
            // Drops lower jaw down and tilts open
            mouthMesh.position.z = -mouthOpen * 0.12;
            mouthMesh.rotation.x = -mouthOpen * 0.22;
          }

          // Head nodding & talking bob
          const talkBob = Math.sin(time * 8) * 0.03;
          headRigGroup.position.y = talkBob;
          headRigGroup.rotation.x = Math.sin(time * 8) * 0.025;

          // Ears twitch with speech
          if (earMesh) {
            earMesh.rotation.z = Math.sin(time * 12) * 0.04;
          }
        } else if (currentStatus === 'listening') {
          // Attentive listening: mouth closed, curious head tilt
          if (mouthMesh) {
            mouthMesh.position.z = 0;
            mouthMesh.rotation.x = 0;
          }
          headRigGroup.rotation.z += (0.1 - headRigGroup.rotation.z) * 0.1;
          headRigGroup.rotation.x *= 0.95;
          headRigGroup.position.y = Math.sin(time * 2) * 0.015;

          if (earMesh) {
            earMesh.rotation.z = 0.05;
          }
        } else if (currentStatus === 'evaluating') {
          // Thoughtful sway
          if (mouthMesh) {
            mouthMesh.position.z = -0.02;
            mouthMesh.rotation.x = -0.04;
          }
          headRigGroup.rotation.z = Math.sin(time * 3) * 0.05;
          headRigGroup.position.y = Math.sin(time * 4) * 0.02;
        } else {
          // Calm Idle
          if (mouthMesh) {
            mouthMesh.position.z *= 0.85;
            mouthMesh.rotation.x *= 0.85;
          }
          headRigGroup.rotation.z *= 0.92;
          headRigGroup.rotation.x *= 0.92;
          headRigGroup.position.y = 0;
          if (earMesh) {
            earMesh.rotation.z *= 0.92;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousedown', onMouseDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing transition-transform"
      style={{ width: size, height: size }}
      title="3D Fox AI Examiner (Click & drag to rotate)"
    />
  );
};
