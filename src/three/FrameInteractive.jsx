import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import InteractiveItem from "./InteractiveItem";

export default function FrameInteractive({
  id,
  selectedId,
  onPick,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  pop = 0.28,
  children,
  hitbox = [2.2, 1.6, 0.25],
  hitboxZ = 0.12,
  enableHitbox = true,
  disabled = false,
}) {
  const ref = useRef();

  const basePos = useMemo(() => new THREE.Vector3(...position), [position]);
  const baseRot = useMemo(() => new THREE.Euler(...rotation), [rotation]);

  const forward = useMemo(() => {
    return new THREE.Vector3(0, 0, 1).applyEuler(baseRot).normalize();
  }, [baseRot]);

  const isOpen = selectedId === id;

  const tmpTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!ref.current) return;

    if (isOpen) tmpTarget.copy(basePos).addScaledVector(forward, pop);
    else tmpTarget.copy(basePos);

    easing.damp3(ref.current.position, tmpTarget, 0.18, dt);

    const s = isOpen ? 1.015 : 1.0;
    easing.damp3(ref.current.scale, [s, s, 1], 0.18, dt);
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <InteractiveItem disabled={disabled} onPick={() => onPick?.(id)}>
      
        <group>
          {children}

          {enableHitbox && (
            <mesh position={[0, 0, hitboxZ]}>
              <boxGeometry args={hitbox} />
             
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
        </group>
      </InteractiveItem>
    </group>
  );
}
