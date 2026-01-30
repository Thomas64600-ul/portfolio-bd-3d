import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import InteractiveItem from "./InteractiveItem";

export default function FrameInteractive({
  id,                 // string unique: "diploma-0"
  selectedId,         // id actuellement ouvert
  onPick,             // (id) => void
  position = [0,0,0],
  rotation = [0,0,0],
  pop = 0.28,         // distance d’avance
  children,
  hitbox = [2.2, 1.6, 0.25], // taille hitbox par défaut
  hitboxZ = 0.10,     // hitbox un peu devant
  enableHitbox = true,
}) {
  const ref = useRef();

  const basePos = useMemo(() => new THREE.Vector3(...position), [position]);
  const baseRot = useMemo(() => new THREE.Euler(...rotation), [rotation]);

  const forward = useMemo(() => {
    // vecteur avant local (0,0,1) transformé par rotation
    return new THREE.Vector3(0, 0, 1).applyEuler(baseRot).normalize();
  }, [baseRot]);

  const isOpen = selectedId === id;

  useFrame((_, dt) => {
    if (!ref.current) return;

    const targetPos = isOpen
      ? basePos.clone().add(forward.clone().multiplyScalar(pop))
      : basePos;

    // Smooth move
    easing.damp3(ref.current.position, targetPos, 0.18, dt);

    // Petite respiration quand ouvert (facultatif)
    const s = isOpen ? 1.015 : 1.0;
    easing.damp3(ref.current.scale, [s, s, 1], 0.18, dt);
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {/* contenu du cadre (image + frame + deco) */}
      {children}

     {/* ✅ Hitbox optionnelle */}
      {enableHitbox && (
        <InteractiveItem onPick={() => onPick(id)}>
          <mesh position={[0, 0, hitboxZ]}>
            <boxGeometry args={hitbox} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </InteractiveItem>
      )}
    </group>
  );
}

