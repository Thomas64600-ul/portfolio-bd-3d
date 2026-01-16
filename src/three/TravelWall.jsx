// src/three/TravelWall.jsx
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import InteractiveItem from "./InteractiveItem";

// itemIndex = index dans SECTIONS.travels.items
const PINS = [
  // EUROPE
  { label: "Pays de Galles", itemIndex: 0, pos: [-1.6, 0.55, 0.07] },
  { label: "Tenerife", itemIndex: 5, pos: [-1.35, 0.05, 0.07] },
  { label: "Minorque", itemIndex: 6, pos: [-1.05, 0.18, 0.07] },

  // ASIE
  { label: "Inde (Sud)", itemIndex: 1, pos: [0.45, 0.05, 0.07] },
  { label: "Vietnam", itemIndex: 3, pos: [0.95, 0.05, 0.07] },
  { label: "Cambodge", itemIndex: 4, pos: [0.85, -0.1, 0.07] },

  // OCEANIE
  { label: "Nouvelle-Calédonie", itemIndex: 2, pos: [1.75, -0.75, 0.07] },
];

function Pin({ position, active, onPick }) {
  const groupRef = useRef();
  const { camera } = useThree();

  // petit halo “glow” (simple et efficace)
  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ff4d6d"),
        emissive: new THREE.Color("#ff4d6d"),
        emissiveIntensity: active ? 1.4 : 0.4,
        roughness: 0.35,
        metalness: 0.0,
      }),
    [active]
  );

  useFrame(() => {
    if (!groupRef.current) return;

    // effet proximité (grossit un peu quand on est près)
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const d = camera.position.distanceTo(worldPos);

    const nearScale = d < 3 ? 1.18 : 1.0;
    const activeScale = active ? 1.35 : 1.0;
    const targetScale = nearScale * activeScale;

    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.12
    );

    // effet “sort du mur” quand actif (avance sur Z local)
    const targetZ = active ? 0.18 : 0.0;
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      0.12
    );
  });

  return (
    <InteractiveItem onPick={onPick}>
      <group ref={groupRef} position={position}>
        {/* halo */}
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[0.12, 24]} />
          <primitive object={glowMat} attach="material" />
        </mesh>

        {/* pin */}
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <primitive object={glowMat} attach="material" />
        </mesh>

        {/* petite tige (style épingle) */}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.18, 10]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.7} />
        </mesh>
      </group>
    </InteractiveItem>
  );
}

export default function TravelWall({ onPickPin, activeIndex = null }) {
  const inkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1a22"),
        roughness: 0.8,
        metalness: 0.05,
      }),
    []
  );

  const paperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#e6dfd4"),
        roughness: 0.92,
        metalness: 0.0,
      }),
    []
  );

  return (
    // ✅ Mur droit (x proche du mur 11) + orienté vers la salle
    <group position={[10.85, 2.35, -1]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Cadre */}
      <mesh>
        <boxGeometry args={[5.8, 3.4, 0.08]} />
        <primitive object={inkMat} attach="material" />
      </mesh>

      {/* “Carte” (papier) */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[5.5, 3.1, 0.03]} />
        <primitive object={paperMat} attach="material" />
      </mesh>

      {/* Bandeau titre (style BD) */}
      <mesh position={[0, 1.45, 0.09]}>
        <boxGeometry args={[3.3, 0.18, 0.02]} />
        <primitive object={inkMat} attach="material" />
      </mesh>

      {/* Pins */}
      {PINS.map((p) => (
        <Pin
          key={p.itemIndex}
          position={p.pos}
          active={activeIndex === p.itemIndex}
          onPick={() => onPickPin(p.itemIndex)}
        />
      ))}
    </group>
  );
}
