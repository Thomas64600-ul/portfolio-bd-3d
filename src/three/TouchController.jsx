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

  useEffect(() => {
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = e.y;
    pitch.current = e.x;
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;

    const clearCooldownTimer = () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    };

    const hardStopTouch = (e) => {
      pointerDown.current = false;
      dragging.current = false;
      activePointerId.current = null;

      clearCooldownTimer();
      setGlobalLooking(false);
      setTouchCooldown(false);

      try {
        if (e?.pointerId != null) el.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerDown = (e) => {
      if (!enabled) return;
      if (e.pointerType !== "touch") return;

   
      if (isMapMode()) {
        hardStopTouch(e);
        return;
      }

      if (uiBlocksLook()) return;

      pointerDown.current = true;
      dragging.current = false;
      activePointerId.current = e.pointerId ?? null;

      start.current = { x: e.clientX, y: e.clientY };
      last.current = { x: e.clientX, y: e.clientY };

      try {
        el.setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }

      clearCooldownTimer();
      setTouchCooldown(false);
      setGlobalLooking(false);
    };

    const onPointerMove = (e) => {
      if (!enabled) return;
      if (e.pointerType !== "touch") return;
      if (!pointerDown.current) return;
      if (activePointerId.current != null && e.pointerId !== activePointerId.current) return;

      if (isMapMode()) {
        hardStopTouch(e);
        return;
      }

      const dxTotal = e.clientX - start.current.x;
      const dyTotal = e.clientY - start.current.y;

      if (!dragging.current) {
        const dist = Math.hypot(dxTotal, dyTotal);
        if (dist >= dragThresholdPx) {
          dragging.current = true;
          setGlobalLooking(true);
        } else {
          return;
        }
      }

      e.preventDefault?.();

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };

      yaw.current -= dx * lookSpeed;
      pitch.current -= dy * lookSpeed;

      const limit = Math.PI / 2 - 0.08;
      if (pitch.current > limit) pitch.current = limit;
      if (pitch.current < -limit) pitch.current = -limit;
    };

    const endTouch = (e) => {
      if (activePointerId.current != null && e?.pointerId != null && e.pointerId !== activePointerId.current) {
        return;
      }

      pointerDown.current = false;
      activePointerId.current = null;

      setGlobalLooking(false);

      if (dragging.current) {
        dragging.current = false;
        setTouchCooldown(true);
        clearCooldownTimer();
        cooldownTimer.current = setTimeout(() => setTouchCooldown(false), 140);
      }

      try {
        if (e?.pointerId != null) el.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", endTouch, { passive: true });
    el.addEventListener("pointercancel", endTouch, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endTouch);
      el.removeEventListener("pointercancel", endTouch);

      clearCooldownTimer();
      setGlobalLooking(false);
      setTouchCooldown(false);
    };
  }, [enabled, gl, lookSpeed, dragThresholdPx]);

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

      if (enableShelfCollision) {
        const centers = [-6.2, 0, 6.2];
        const halfW = 2.35;
        const stopZ = -6.05;

        const z = camera.position.z;
        const x = camera.position.x;

        if (z < stopZ) {
          const insideAny = centers.some((cx) => x > cx - halfW && x < cx + halfW);
          if (insideAny) camera.position.z = stopZ;
        }
      }
    }
  });

  return null;
}

