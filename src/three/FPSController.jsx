import { useEffect, useRef, useState, useCallback } from "react";
import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const DEBUG_FPS_PICK = false;

export default function FPSController({
  enabled,
  onLockChange,
  bounds = { minX: -8, maxX: 8, minZ: -10, maxZ: 6 },
}) {
  const controlsRef = useRef();
  const { camera, gl, scene } = useThree();

  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    up: false,
    left: false,
    down: false,
    right: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const [locked, setLocked] = useState(false);

  // Raycaster / Vector2 réutilisés (évite de recréer des objets à chaque clic)
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcCenterRef = useRef(new THREE.Vector2(0, 0));

  const resetKeys = useCallback(() => {
    Object.keys(keys.current).forEach((k) => (keys.current[k] = false));
  }, []);

  // Raycast FPS au centre de l'écran (utile en PointerLock)
  const pickCenter = useCallback(() => {
    const raycaster = raycasterRef.current;
    const ndc = ndcCenterRef.current;

    raycaster.setFromCamera(ndc, camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    if (!hits.length) return false;

    for (const hit of hits) {
      const obj = hit.object;
      if (obj?.userData?.pick) {
        if (DEBUG_FPS_PICK) {
          console.log(
            "🎯 FPS PICK:",
            obj.userData.type,
            obj.userData.label,
            obj.userData.itemIndex
          );
        }
        obj.userData.pick();
        return true;
      }
    }
    return false;
  }, [camera, scene]);

  // Si enabled passe à false : on unlock + stop net
  useEffect(() => {
    if (enabled) return;

    const controls = controlsRef.current;

    if (document.pointerLockElement) document.exitPointerLock();
    if (controls?.isLocked) controls.unlock();

    resetKeys();
    velocity.current.set(0, 0, 0);
    setLocked(false);
    onLockChange?.(false);
  }, [enabled, onLockChange, resetKeys]);

  // Mouvement clavier
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
      if (!enabled) return;
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

  // Lock/unlock events
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onLock = () => {
      setLocked(true);
      onLockChange?.(true);
    };

    const onUnlock = () => {
      setLocked(false);
      resetKeys();
      velocity.current.set(0, 0, 0);

      if (document.pointerLockElement) document.exitPointerLock();
      onLockChange?.(false);
    };

    controls.addEventListener("lock", onLock);
    controls.addEventListener("unlock", onUnlock);
    return () => {
      controls.removeEventListener("lock", onLock);
      controls.removeEventListener("unlock", onUnlock);
    };
  }, [onLockChange, resetKeys]);

  // Clic souris en FPS => raycast centre écran
  useEffect(() => {
    if (!enabled || !locked) return;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;

      const picked = pickCenter();
      if (picked) e.preventDefault();
    };

    window.addEventListener("mousedown", onMouseDown, { passive: false });
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [enabled, locked, pickCenter]);

  // Déplacement
  useFrame((_, dt) => {
    if (!enabled || !locked) return;

    const speed = 3.2;
    const damping = 10;

    const forward =
      (keys.current.w || keys.current.up ? 1 : 0) -
      (keys.current.s || keys.current.down ? 1 : 0);

    const strafe =
      (keys.current.d || keys.current.right ? 1 : 0) -
      (keys.current.a || keys.current.left ? 1 : 0);

    velocity.current.x -= velocity.current.x * damping * dt;
    velocity.current.z -= velocity.current.z * damping * dt;

    if (forward !== 0) velocity.current.z -= forward * speed * dt;
    if (strafe !== 0) velocity.current.x += strafe * speed * dt;

    const dir = new THREE.Vector3(velocity.current.x, 0, velocity.current.z);
    dir.applyQuaternion(camera.quaternion);

    camera.position.add(dir);

    camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
    camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    camera.position.y = 1.6;
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enabled={enabled}
    />
  );
}
