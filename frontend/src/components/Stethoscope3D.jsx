import React, { useEffect, useRef, useState } from 'react';

/**
 * 3D Rotating Stethoscope Visualization.
 * Uses Three.js WebGL rendering with metallic silver, gold accents, sky-blue neon glow, and purple reflections.
 * Includes automatic 2D CSS/SVG fallback if WebGL is unavailable or encounters an error.
 */
export default function Stethoscope3D() {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    let animationFrameId;
    let renderer, scene, camera, stethGroup;

    try {
      // Dynamic import of Three.js to prevent SSR/loading blocks
      import('three').then((THREE) => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth || 300;
        const height = containerRef.current.clientHeight || 300;

        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 8);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const skyLight = new THREE.PointLight(0x38bdf8, 3, 20); // Sky Blue Neon
        skyLight.position.set(4, 4, 4);
        scene.add(skyLight);

        const purpleLight = new THREE.PointLight(0xa855f7, 2, 20); // Purple Neon
        purpleLight.position.set(-4, -4, 2);
        scene.add(purpleLight);

        const goldLight = new THREE.PointLight(0xfbbf24, 2, 15); // Gold Accent Light
        goldLight.position.set(0, -5, 3);
        scene.add(goldLight);

        // Create 3D Stethoscope Model Group
        stethGroup = new THREE.Group();

        // Materials
        const silverMaterial = new THREE.MeshStandardMaterial({
          color: 0xcbd5e1,
          metalness: 0.9,
          roughness: 0.2
        });

        const goldMaterial = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.95,
          roughness: 0.15
        });

        const tubingMaterial = new THREE.MeshStandardMaterial({
          color: 0x080a0f,
          roughness: 0.3,
          metalness: 0.5
        });

        const neonRimMaterial = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true
        });

        // Chest Piece (Diaphragm) - Metallic cylinder + Gold ring
        const chestBaseGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 32);
        const chestBase = new THREE.Mesh(chestBaseGeo, silverMaterial);

        const goldRingGeo = new THREE.TorusGeometry(1.22, 0.05, 16, 32);
        const goldRing = new THREE.Mesh(goldRingGeo, goldMaterial);
        goldRing.rotation.x = Math.PI / 2;
        chestBase.add(goldRing);

        const neonGlowRingGeo = new THREE.TorusGeometry(1.15, 0.02, 16, 32);
        const neonGlowRing = new THREE.Mesh(neonGlowRingGeo, neonRimMaterial);
        neonGlowRing.rotation.x = Math.PI / 2;
        chestBase.add(neonGlowRing);

        stethGroup.add(chestBase);

        // Tubing - Curved Tube Geometry
        class StethoscopeCurve extends THREE.Curve {
          getPoint(t) {
            const angle = t * Math.PI * 1.8;
            const radius = 1.6 * (1 - t * 0.4);
            const x = Math.cos(angle) * radius;
            const y = -t * 3.2 + 0.8;
            const z = Math.sin(angle) * 0.5;
            return new THREE.Vector3(x, y, z);
          }
        }
        const tubePath = new StethoscopeCurve();
        const tubeGeo = new THREE.TubeGeometry(tubePath, 64, 0.12, 16, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, tubingMaterial);
        tubeMesh.position.set(0, -0.2, 0);
        stethGroup.add(tubeMesh);

        // Earpieces (Binaural Tubes)
        const binauralLeftGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.0, 16);
        const earpieceLeft = new THREE.Mesh(binauralLeftGeo, silverMaterial);
        earpieceLeft.position.set(-0.7, 2.2, 0);
        earpieceLeft.rotation.z = -0.3;

        const earpieceRight = new THREE.Mesh(binauralLeftGeo, silverMaterial);
        earpieceRight.position.set(0.7, 2.2, 0);
        earpieceRight.rotation.z = 0.3;

        // Ear tips (Gold)
        const earTipGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const tipLeft = new THREE.Mesh(earTipGeo, goldMaterial);
        tipLeft.position.set(0, 1.0, 0);
        earpieceLeft.add(tipLeft);

        const tipRight = new THREE.Mesh(earTipGeo, goldMaterial);
        tipRight.position.set(0, 1.0, 0);
        earpieceRight.add(tipRight);

        stethGroup.add(earpieceLeft);
        stethGroup.add(earpieceRight);

        // Center on screen
        stethGroup.position.set(0, -0.5, 0);
        scene.add(stethGroup);

        // Floating & Rotation Animation Loop
        let clock = new THREE.Clock();
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          const elapsedTime = clock.getElapsedTime();

          if (stethGroup) {
            stethGroup.rotation.y = elapsedTime * 0.5;
            stethGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.1;
            stethGroup.position.y = -0.5 + Math.sin(elapsedTime * 1.5) * 0.15;
          }

          renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current || !renderer || !camera) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);
      }).catch((err) => {
        console.warn("WebGL Three.js initialization failed, rendering 2D fallback:", err);
        setWebglSupported(false);
      });
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
    <div className="relative w-full h-full min-h-[260px] flex items-center justify-center overflow-hidden rounded-2xl glass-panel p-4">
      {/* Background Neon Aura */}
      <div className="absolute w-48 h-48 rounded-full bg-[#38BDF8]/10 blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute w-36 h-36 rounded-full bg-[#A855F7]/10 blur-2xl animate-float pointer-events-none" />

      {webglSupported ? (
        <div ref={containerRef} className="w-full h-[260px] cursor-grab active:cursor-grabbing" />
      ) : (
        /* Fallback 2D Animated CSS Stethoscope */
        <div className="relative flex flex-col items-center justify-center p-6 text-center animate-float">
          <div className="w-24 h-24 rounded-full border-4 border-[#CBD5E1] bg-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] border-t-[#FBBF24]">
            <div className="w-12 h-12 rounded-full border-2 border-[#38BDF8] bg-[#0EA5E9]/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#FBBF24] animate-ping" />
            </div>
          </div>
          <span className="mt-3 text-xs font-mono text-[#38BDF8] tracking-widest uppercase">
            3D Medical Adherence Engine Active
          </span>
        </div>
      )}

      {/* Decorative Overlay Badge */}
      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 border border-[#38BDF8]/30 backdrop-blur-md text-[10px] font-mono text-[#38BDF8] flex items-center gap-1.5 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
        REAL-TIME 3D VISUALIZER
      </div>
    </div>
  );
}
