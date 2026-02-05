import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function TouchController({
  enabled = true,
  forwardRef,
  backRef,
  speed = 4.2,
  lookSpeed = 0.0045,
  bounds = { minX: -8, maxX: 8, minZ: -10, maxZ: 6 },
  dragThresholdPx = 10,
  enableShelfCollision = true,
}) {
  const { camera, gl } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(0);

  const pointerDown = useRef(false);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });

  const cooldownTimer = useRef(null);
  const activePointerId = useRef(null);

  const captured = useRef(false);

  const setGlobalLooking = (v) => {
    if (typeof window === "undefined") return;
    window.__TOUCH_LOOKING__ = !!v;
  };

  const setTouchCooldown = (v) => {
    if (typeof window === "undefined") return;
    window.__TOUCH_LOOKING_COOLDOWN__ = !!v;
  };

  const uiBlocksLook = () => {
    if (typeof window === "undefined") return false;
    return !!window.__UI_ACTIVE__ || !!window.__JOYSTICK_ACTIVE__;
  };

  const isMapMode = () => {
    if (typeof window === "undefined") return false;
    return !!window.__MAP_MODE__;
  };

  
  const isMapMoveBlocked = () => {
    if (typeof window === "undefined") return false;
    const until = Number(window.__MAP_INTERACT_UNTIL__ || 0);
    return Date.now() < until;
  };

  const hardStopMoveRefs = () => {
    if (forwardRef && typeof forwardRef.current === "boolean") forwardRef.current = false;
    if (backRef && typeof backRef.current === "boolean") backRef.current = false;

    if (typeof window !== "undefined") {
      window.__UI_ACTIVE__ = false;
      window.__JOYSTICK_ACTIVE__ = false;
    }
  };

  useEffect(() => {
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = e.y;
    pitch.current = e.x;
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;

    const clearCooldown = () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
        cooldownTimer.current = null;
      }
      setTouchCooldown(false);
    };

    const releaseCaptureIfNeeded = (pointerId) => {
      if (!captured.current) return;
      captured.current = false;
      try {
        if (pointerId != null) el.releasePointerCapture?.(pointerId);
      } catch {
        // ignore
      }
    };

    const hardStop = (e) => {
      pointerDown.current = false;
      dragging.current = false;
      activePointerId.current = null;

      clearCooldown();
      setGlobalLooking(false);

      releaseCaptureIfNeeded(e?.pointerId);
    };

    const onPointerDown = (e) => {
      if (!enabled) return;
      if (e.pointerType !== "touch") return;

      if (isMapMode()) {
        hardStop(e);
        return;
      }

      
      if (uiBlocksLook()) return;

      pointerDown.current = true;
      dragging.current = false;
      captured.current = false;

      activePointerId.current = e.pointerId ?? null;

      start.current = { x: e.clientX, y: e.clientY };
      last.current = { x: e.clientX, y: e.clientY };

      clearCooldown();
      setGlobalLooking(false);
    };

    const onPointerMove = (e) => {
      if (!enabled) return;
      if (e.pointerType !== "touch") return;
      if (!pointerDown.current) return;
      if (activePointerId.current != null && e.pointerId !== activePointerId.current) return;

      if (isMapMode()) {
        hardStop(e);
        return;
      }

      const dxT = e.clientX - start.current.x;
      const dyT = e.clientY - start.current.y;

      if (!dragging.current) {
        if (Math.hypot(dxT, dyT) >= dragThresholdPx) {
          dragging.current = true;
          setGlobalLooking(true);

          try {
            el.setPointerCapture?.(e.pointerId);
            captured.current = true;
          } catch {
            // ignore
          }
        } else {
          return;
        }
      }

      e.preventDefault?.();

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };

      yaw.current += dx * lookSpeed;
      pitch.current += dy * lookSpeed;

      const limit = Math.PI / 2 - 0.08;
      pitch.current = Math.max(-limit, Math.min(limit, pitch.current));
    };

    const onPointerEnd = (e) => {
      if (activePointerId.current != null && e?.pointerId !== activePointerId.current) return;

      pointerDown.current = false;
      activePointerId.current = null;

      setGlobalLooking(false);

      if (dragging.current) {
        dragging.current = false;

        setTouchCooldown(true);
        if (cooldownTimer.current) clearTimeout(cooldownTimer.current);

        cooldownTimer.current = setTimeout(() => {
          setTouchCooldown(false);
          cooldownTimer.current = null;
        }, 70);
      }

      releaseCaptureIfNeeded(e?.pointerId);
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerEnd, { passive: true });
    el.addEventListener("pointercancel", onPointerEnd, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);

      clearCooldown();
      setGlobalLooking(false);
      releaseCaptureIfNeeded(activePointerId.current);
    };
  }, [enabled, gl, lookSpeed, dragThresholdPx]);

  const forwardDir = useRef(new THREE.Vector3());
  const moveVec = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    if (!enabled) return;


    if (isMapMode() || isMapMoveBlocked()) {
      hardStopMoveRefs();
    }

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

      if (enableShelfCollision) {
        const centers = [-6.2, 0, 6.2];
        const halfW = 2.35;
        const stopZ = -6.05;

        if (camera.position.z < stopZ) {
          const inside = centers.some(
            (cx) => camera.position.x > cx - halfW && camera.position.x < cx + halfW
          );
          if (inside) camera.position.z = stopZ;
        }
      }
    }
  });

  return null;
}

