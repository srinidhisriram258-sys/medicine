import React, { useEffect, useRef, useState } from 'react';

/**
 * 3D Rotating Pill Bottle & Capsule Medical Visualizer.
 * Uses Three.js WebGL rendering with sky-blue neon, gold, metallic silver materials.
 * Includes automatic 2D CSS/SVG fallback if WebGL is unavailable.
 */
export default function PillBottle3D() {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    let animationFrameId;
    let renderer, scene, camera, group;

    try {
      import('three').then((THREE) => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth || 280;
        const height = containerRef.current.clientHeight || 240;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 7);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const skyLight = new THREE.PointLight(0x38bdf8, 2.5, 20);
        skyLight.position.set(3, 4, 4);
        scene.add(skyLight);

        const goldLight = new THREE.PointLight(0xfbbf24, 2.0, 15);
        goldLight.position.set(-3, -3, 3);
        scene.add(goldLight);

        group = new THREE.Group();

        // Materials
        const bottleMaterial = new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          transparent: true,
          opacity: 0.85,
          roughness: 0.1,
          metalness: 0.8
        });

        const capMaterial = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.9,
          roughness: 0.2
        });

        const capsuleTopMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.7,
          roughness: 0.2
        });

        const capsuleBottomMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          metalness: 0.6,
          roughness: 0.3
        });

        // Pill Bottle Body
        const bottleGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 32);
        const bottleMesh = new THREE.Mesh(bottleGeo, bottleMaterial);

        // Cap
        const capGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.4, 32);
        const capMesh = new THREE.Mesh(capGeo, capMaterial);
        capMesh.position.y = 1.3;
        bottleMesh.add(capMesh);

        group.add(bottleMesh);

        // Floating Capsules Around Bottle
        const capsuleGroup = new THREE.Group();
        const capTopGeo = new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const capBotGeo = new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);

        const pill1 = new THREE.Group();
        pill1.add(new THREE.Mesh(capTopGeo, capsuleTopMat));
        const botMesh = new THREE.Mesh(capBotGeo, capsuleBottomMat);
        botMesh.position.y = 0;
        pill1.add(botMesh);
        pill1.position.set(1.6, 0.5, 0.5);
        pill1.rotation.z = 0.5;

        capsuleGroup.add(pill1);
        group.add(capsuleGroup);

        group.position.set(0, -0.2, 0);
        scene.add(group);

        let clock = new THREE.Clock();
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          const t = clock.getElapsedTime();

          if (group) {
            group.rotation.y = t * 0.6;
            group.position.y = -0.2 + Math.sin(t * 1.4) * 0.1;
          }

          renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
          if (!containerRef.current || !renderer || !camera) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);
      }).catch((e) => setWebglSupported(false));
    } catch (e) {
      setWebglSupported(false);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer?.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center overflow-hidden rounded-2xl glass-panel p-3">
      <div className="absolute w-40 h-40 rounded-full bg-[#38BDF8]/10 blur-2xl pointer-events-none" />
      {webglSupported ? (
        <div ref={containerRef} className="w-full h-[220px]" />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#FBBF24] p-0.5 shadow-lg animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-[#38BDF8] font-bold text-xl">
              Rx
            </div>
          </div>
          <span className="mt-2 text-[11px] font-mono text-[#38BDF8]">3D Prescription Container</span>
        </div>
      )}
    </div>
  );
}
