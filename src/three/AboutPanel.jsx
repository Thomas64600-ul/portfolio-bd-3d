import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import InteractiveItem from "./InteractiveItem";

export default function AboutPanel({ onPick }) {
  const groupRef = useRef();

  // Matériaux cohérents avec ta salle (papier + encre)
  const paperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#e6dfd4"),
        roughness: 0.92,
        metalness: 0.0,
      }),
    []
  );

  const inkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1a22"),
        roughness: 0.8,
        metalness: 0.06,
      }),
    []
  );

  // Petit "life" sans gérer la distance (léger flottement + micro zoom)
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // micro flottement
    groupRef.current.position.y = 2.2 + Math.sin(t * 0.8) * 0.015;

    // micro respiration (scale)
    const s = 1 + Math.sin(t * 0.9) * 0.008;
    groupRef.current.scale.set(s, s, 1);
  });

  return (
    <InteractiveItem onPick={onPick}>
      {/* IMPORTANT : z = -7.55 pour être devant le mur (évite le z-fighting) */}
      <group ref={groupRef} position={[0, 2.2, -7.55]} rotation={[0, 0, 0]}>
        {/* Cadre (encre) derrière */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[2.55, 3.35, 0.03]} />
          <primitive object={inkMat} attach="material" />
        </mesh>

        {/* Fond panneau (papier) */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[2.4, 3.2, 0.05]} />
          <primitive object={paperMat} attach="material" />
        </mesh>

        {/* Petit cartouche en haut (optionnel mais stylé) */}
        <mesh position={[0, 1.35, 0.06]}>
          <boxGeometry args={[1.6, 0.35, 0.02]} />
          <primitive object={inkMat} attach="material" />
        </mesh>

        {/* Liseré clair sur le cartouche */}
        <mesh position={[0, 1.35, 0.075]}>
          <boxGeometry args={[1.52, 0.27, 0.01]} />
          <primitive object={paperMat} attach="material" />
        </mesh>
      </group>
    </InteractiveItem>
  );
}
