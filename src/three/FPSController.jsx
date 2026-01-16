import { useEffect, useRef, useState } from "react";
import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function FPSController({ enabled, onLockChange, bounds = { minX: -8, maxX: 8, minZ: -10, maxZ: 6 } }) {
  const controlsRef = useRef();
  const { camera, gl } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, up: false, left: false, down: false, right: false });
  const velocity = useRef(new THREE.Vector3());
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!enabled) return;
      if (e.code === "KeyW") keys.current.w = true;
      if (e.code === "KeyA") keys.current.a = true;
      if (e.code === "KeyS") keys.current.s = true;
      if (e.code === "KeyD") keys.current.d = true;
      if (e.code === "ArrowUp") keys.current.up = true;
      if (e.code === "ArrowLeft") keys.current.left = true;
      if (e.code === "ArrowDown") keys.current.down = true;
      if (e.code === "ArrowRight") keys.current.right = true;
    };
    const onKeyUp = (e) => {
      if (e.code === "KeyW") keys.current.w = false;
      if (e.code === "KeyA") keys.current.a = false;
      if (e.code === "KeyS") keys.current.s = false;
      if (e.code === "KeyD") keys.current.d = false;
      if (e.code === "ArrowUp") keys.current.up = false;
      if (e.code === "ArrowLeft") keys.current.left = false;
      if (e.code === "ArrowDown") keys.current.down = false;
      if (e.code === "ArrowRight") keys.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [enabled]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onLock = () => {
      setLocked(true);
      onLockChange?.(true);
    };
    const onUnlock = () => {
      setLocked(false);
      onLockChange?.(false);
    };

    controls.addEventListener("lock", onLock);
    controls.addEventListener("unlock", onUnlock);
    return () => {
      controls.removeEventListener("lock", onLock);
      controls.removeEventListener("unlock", onUnlock);
    };
  }, [onLockChange]);

  useFrame((_, dt) => {
    if (!enabled || !locked) return;

    const speed = 3.2; // marche douce
    const damping = 10;

    // direction locale (avant/arrière, gauche/droite)
    const forward =
      (keys.current.w || keys.current.up ? 1 : 0) - (keys.current.s || keys.current.down ? 1 : 0);
    const strafe =
      (keys.current.d || keys.current.right ? 1 : 0) - (keys.current.a || keys.current.left ? 1 : 0);

    // amortissement
    velocity.current.x -= velocity.current.x * damping * dt;
    velocity.current.z -= velocity.current.z * damping * dt;

    if (forward !== 0) velocity.current.z -= forward * speed * dt;
    if (strafe !== 0) velocity.current.x += strafe * speed * dt;

    // appliquer dans l’espace caméra
    const dir = new THREE.Vector3(velocity.current.x, 0, velocity.current.z);
    dir.applyQuaternion(camera.quaternion);

    camera.position.add(dir);

    // limites de déplacement
    camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
    camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    camera.position.y = 1.6; // hauteur FPS
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enabled={enabled}
    />
  );
}
