// src/three/TouchController.jsx
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * TouchController (mobile)
 * - Glisser (1 doigt) = tourner la caméra (yaw/pitch)
 * - forwardRef/backRef = refs booléennes pour avancer/reculer (boutons Overlay)
 *
 * ✅ Perf-friendly : pas de state React, uniquement des refs.
 */
export default function TouchController({
  enabled = true,
  forwardRef,
  backRef,
  speed = 2.2,
  lookSpeed = 0.004,
  bounds = { minX: -8, maxX: 8, minZ: -10, maxZ: 6 },
  lockWhileInteracting = false, // si tu veux ignorer quand un panel est ouvert plus tard
}) {
  const { camera, gl } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(0);

  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Init yaw/pitch à partir de la rotation actuelle de la caméra
  useEffect(() => {
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = e.y;
    pitch.current = e.x;
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;

    const onTouchStart = (e) => {
      if (!enabled) return;
      if (lockWhileInteracting) return;

      // 1 doigt = look
      const t = e.touches?.[0];
      if (!t) return;

      dragging.current = true;
      last.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchMove = (e) => {
      if (!enabled) return;
      if (!dragging.current) return;

      const t = e.touches?.[0];
      if (!t) return;

      const dx = t.clientX - last.current.x;
      const dy = t.clientY - last.current.y;
      last.current = { x: t.clientX, y: t.clientY };

      yaw.current -= dx * lookSpeed;
      pitch.current -= dy * lookSpeed;

      // clamp pitch pour éviter de passer la tête à l’envers
      const limit = Math.PI / 2 - 0.08;
      if (pitch.current > limit) pitch.current = limit;
      if (pitch.current < -limit) pitch.current = -limit;
    };

    const onTouchEnd = () => {
      dragging.current = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, gl, lookSpeed, lockWhileInteracting]);

  const forwardDir = useRef(new THREE.Vector3());
  const moveVec = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    if (!enabled) return;

    // Appliquer rotation caméra
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    const fwd = !!forwardRef?.current;
    const back = !!backRef?.current;
    const move = (fwd ? 1 : 0) + (back ? -1 : 0);

    if (move !== 0) {
      // direction caméra (au sol)
      camera.getWorldDirection(forwardDir.current);
      forwardDir.current.y = 0;
      forwardDir.current.normalize();

      moveVec.current.copy(forwardDir.current).multiplyScalar(move * speed * dt);
      camera.position.add(moveVec.current);

      // bounds simples (comme ton FPSController)
      camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
      camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    }
  });

  return null;
}
