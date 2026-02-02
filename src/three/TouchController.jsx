import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function TouchController({
  enabled = true,
  forwardRef,
  backRef,
  speed = 2.2,
  lookSpeed = 0.004,
  bounds = { minX: -8, maxX: 8, minZ: -10, maxZ: 6 },
  lockWhileInteracting = false,
  dragThresholdPx = 10,
}) {
  const { camera, gl } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(0);

  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });

  const setGlobalDragging = (v) => {
  
    window.__TOUCH_LOOKING__ = !!v;
  };

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

      const t = e.touches?.[0];
      if (!t) return;

      dragging.current = true;
      dragMoved.current = false;
      start.current = { x: t.clientX, y: t.clientY };
      last.current = { x: t.clientX, y: t.clientY };

      e.preventDefault?.();
    };

    const onTouchMove = (e) => {
      if (!enabled) return;
      if (!dragging.current) return;

      const t = e.touches?.[0];
      if (!t) return;

      const dxTotal = t.clientX - start.current.x;
      const dyTotal = t.clientY - start.current.y;

      if (!dragMoved.current) {
        const dist = Math.hypot(dxTotal, dyTotal);
        if (dist >= dragThresholdPx) {
          dragMoved.current = true;
          setGlobalDragging(true);
        }
      }

      if (dragMoved.current) {
        const dx = t.clientX - last.current.x;
        const dy = t.clientY - last.current.y;

        last.current = { x: t.clientX, y: t.clientY };

        yaw.current -= dx * lookSpeed;
        pitch.current -= dy * lookSpeed;

        const limit = Math.PI / 2 - 0.08;
        if (pitch.current > limit) pitch.current = limit;
        if (pitch.current < -limit) pitch.current = -limit;
      }

      e.preventDefault?.();
    };

    const end = (e) => {
      dragging.current = false;

      if (dragMoved.current) {
        dragMoved.current = false;
        setTimeout(() => setGlobalDragging(false), 120);
      } else {
        
        setGlobalDragging(false);
      }

      e?.preventDefault?.();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", end, { passive: false });
    el.addEventListener("touchcancel", end, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
      setGlobalDragging(false);
    };
  }, [enabled, gl, lookSpeed, lockWhileInteracting, dragThresholdPx]);

  const forwardDir = useRef(new THREE.Vector3());
  const moveVec = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    if (!enabled) return;

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    const fwd = !!forwardRef?.current;
    const back = !!backRef?.current;
    const move = (fwd ? 1 : 0) + (back ? -1 : 0);

    if (move !== 0) {
      camera.getWorldDirection(forwardDir.current);
      forwardDir.current.y = 0;
      forwardDir.current.normalize();

      moveVec.current.copy(forwardDir.current).multiplyScalar(move * speed * dt);
      camera.position.add(moveVec.current);

      camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
      camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    }
  });

  return null;
}

