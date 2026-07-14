"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// 🎨 DYNAMIC COLOR MAPPING FOR MODES
const modeColors = {
  document: "#00ffff", // Cyan for RAG Core
  aiml: "#b026ff",     // Neon Purple for AI/ML Node
  medical: "#00ff66"   // Emerald Green for Bio-Med
};

function FloatingRobot({ mode }: { mode: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Get the active color based on the selected mode
  const activeColor = modeColors[mode as keyof typeof modeColors] || "#00ffff";

  // Head tracking
  useFrame((state) => {
    if (groupRef.current) {
      const targetX = (state.pointer.x * Math.PI) / 4;
      const targetY = (state.pointer.y * Math.PI) / 4;
      groupRef.current.rotation.y += 0.05 * (targetX - groupRef.current.rotation.y);
      groupRef.current.rotation.x += 0.05 * (-targetY - groupRef.current.rotation.x);
    }
  });

  const darkSteel = <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.3} />;
  const blackSteel = <meshStandardMaterial color="#0a0a0f" metalness={0.9} roughness={0.4} />;
  
  // 🌟 DYNAMIC GLOW MATERIAL
  const dynamicGlow = <meshStandardMaterial color={activeColor} emissive={activeColor} emissiveIntensity={2} />;

  return (
    <Float speed={2.5} rotationIntensity={0.4} floatIntensity={1.5}>
      <group ref={groupRef} scale={1.3} position={[0, 0.3, 0]}>
        
        {/* NECK */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.2, 0.5, 0.6, 32]} />
          {blackSteel}
        </mesh>

        {/* HEAD */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 1.4, 1.2]} />
          {darkSteel}
        </mesh>

        {/* LEFT EAR */}
        <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
          {dynamicGlow}
        </mesh>

        {/* RIGHT EAR */}
        <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
          {dynamicGlow}
        </mesh>

        {/* ANTENNA BASE */}
        <mesh position={[0.2, 0.8, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.05, 0.08, 0.5]} />
          {blackSteel}
        </mesh>

        {/* ANTENNA GLOWING TIP */}
        <mesh position={[0.28, 1.05, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          {dynamicGlow}
        </mesh>

        {/* LEFT EYE */}
        <mesh position={[-0.35, 0.1, 0.61]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>

        {/* RIGHT EYE */}
        <mesh position={[0.35, 0.1, 0.61]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>

        {/* GLOWING SMILE */}
        <mesh position={[0, -0.25, 0.61]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.25, 0.04, 16, 32, Math.PI]} />
          {dynamicGlow}
        </mesh>

      </group>
    </Float>
  );
}

// Accept mode prop to pass to the robot
export default function Scene3D({ mode = "document" }: { mode?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="absolute inset-0 bg-[#050505]" />;

  return (
    <div className="absolute inset-0 z-0 opacity-90 transition-opacity duration-1000">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[0, -5, 5]} intensity={1} color={modeColors[mode as keyof typeof modeColors] || "#00ffff"} />
        <Environment preset="city" />
        <FloatingRobot mode={mode} />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
      </Canvas>
    </div>
  );
}