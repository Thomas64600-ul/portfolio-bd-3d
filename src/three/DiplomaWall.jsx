import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import InteractiveItem from "./InteractiveItem";

function DiplomaFrame({
  index,
  position,
  onPick,
  isActive,
  size = [1.2, 0.85],
}) {
  const groupRef = useRef();
  const contentRef = useRef();
  const { camera } = useThree();

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

  useFrame(() => {
    if (!groupRef.current || !contentRef.current) return;

    // Proximité
    const p = new THREE.Vector3();
    groupRef.current.getWorldPosition(p);
    const d = camera.position.distanceTo(p);

    const hoverScale = d < 3 ? 1.06 : 1.0;

    // "Sort du mur"
    const out = isActive ? 0.35 : 0.0;
    const activeScale = isActive ? 1.12 : 1.0;

    const targetScale = hoverScale * activeScale;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, 1),
      0.08
    );

    // déplacement du contenu (pas des enfants via index)
    contentRef.current.position.z = THREE.MathUtils.lerp(
      contentRef.current.position.z,
      out,
      0.12
    );
  });

  return (
    <InteractiveItem onPick={() => onPick(index)}>
      <group ref={groupRef} position={position} rotation={[0, Math.PI / 2, 0]}>
        <group ref={contentRef}>
          {/* Cadre */}
          <mesh>
            <boxGeometry args={[size[0] + 0.12, size[1] + 0.12, 0.05]} />
            <primitive object={inkMat} attach="material" />
          </mesh>

          {/* Papier */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[size[0], size[1], 0.02]} />
            <primitive object={paperMat} attach="material" />
          </mesh>

          {/* petit bandeau */}
          <mesh position={[0, size[1] / 2 - 0.12, 0.06]}>
            <boxGeometry args={[size[0] * 0.75, 0.08, 0.01]} />
            <primitive object={inkMat} attach="material" />
          </mesh>

          {/* ✅ HITBOX invisible (clic facile) */}
          <mesh visible={false}>
            <boxGeometry args={[size[0] + 0.3, size[1] + 0.3, 0.3]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      </group>
    </InteractiveItem>
  );
}


export default function DiplomaWall({ onPickDiplomas, activeIndex }) {
  const x = -10.75;
  const zList = [3.0, 1.4, -0.2, -1.8];
  const y = 2.6;

  return (
    <group>
      {zList.map((z, i) => (
        <DiplomaFrame
          key={i}
          index={i}
          position={[x, y, z]}
          isActive={activeIndex === i}
          onPick={onPickDiplomas}
        />
      ))}
    </group>
  );
}


