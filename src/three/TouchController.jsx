import { useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function TouchController({
  enabled = true,
  forwardRef,
  backRef,
  strafeRef,

  speed = 6.0,
  strafeSpeed = 6.0,
  lookSpeed = 0.007,

  bounds = { minX: -8, maxX: 8, minZ: -10, maxZ: 6 },
  dragThresholdPx = 22,
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

  const baseFovRef = useRef(camera?.isPerspectiveCamera ? camera.fov : 65);

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

  const isInteractingFresh = (pid) => {
    if (typeof window === "undefined") return false;
    if (!window.__INTERACTING__) return false;

    const ts = Number(window.__INTERACTING_TS__ ?? 0);
    if (ts && Date.now() - ts > 220) return false;

    const ipid = window.__INTERACTING_PID__;
    if (ipid == null) return true;
    return pid != null ? ipid === pid : true;
  };

  useEffect(() => {
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = e.y;
    pitch.current = e.x;

    if (camera?.isPerspectiveCamera) {
      baseFovRef.current = camera.fov || 65;
    }
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

    const hardStop = () => {
      pointerDown.current = false;
      dragging.current = false;
      activePointerId.current = null;
      clearCooldown();
      setGlobalLooking(false);
    };

    const onPointerDown = (e) => {
      if (!enabled) return;
      if (e.pointerType !== "touch") return;

      
      if (isMapMode()) {
        hardStop();
        return;
      }

      if (uiBlocksLook()) return;

      pointerDown.current = true;
      dragging.current = false;
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
      if (
        activePointerId.current != null &&
        e.pointerId !== activePointerId.current
      )
        return;

      if (isMapMode()) {
        hardStop();
        return;
      }

      const dxT = e.clientX - start.current.x;
      const dyT = e.clientY - start.current.y;

      if (!dragging.current) {
     
        if (isInteractingFresh(e.pointerId)) {
          return;
        }

        if (Math.hypot(dxT, dyT) >= dragThresholdPx) {
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

      yaw.current += dx * lookSpeed;
      pitch.current += dy * lookSpeed;

      const limit = Math.PI / 2 - 0.08;
      pitch.current = Math.max(-limit, Math.min(limit, pitch.current));
    };

    const onPointerEnd = (e) => {
      if (
        activePointerId.current != null &&
        e?.pointerId !== activePointerId.current
      )
        return;

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
      hardStop();
    };
  }, [enabled, gl, lookSpeed, dragThresholdPx]);

  const forwardDir = useRef(new THREE.Vector3());
  const rightDir = useRef(new THREE.Vector3());
  const moveVec = useRef(new THREE.Vector3());

  const portraitBounds = useMemo(() => {
    return {
      ...bounds,
      minX: Math.min(bounds.minX, -10.2),
      maxX: Math.max(bounds.maxX, 10.2),
    };
  }, [bounds]);

  const mapFovLatchRef = useRef(false);

  const clampAxis = (v) => Math.max(-1, Math.min(1, v));

  useFrame((_, dt) => {
    if (!enabled) return;

    const hasWindow = typeof window !== "undefined";
    const isPortrait = hasWindow ? window.innerHeight > window.innerWidth : false;
    const isMap = hasWindow ? !!window.__MAP_MODE__ : false;

    if (camera?.isPerspectiveCamera) {
      const baseFov = baseFovRef.current || 65;
      const mapFov = 90;

      if (isPortrait && isMap) mapFovLatchRef.current = true;
      if (!isMap) mapFovLatchRef.current = false;

      const targetFov = isPortrait && mapFovLatchRef.current ? mapFov : baseFov;

      camera.fov += (targetFov - camera.fov) * 0.12;
      camera.updateProjectionMatrix();
    }

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    const b = isPortrait ? portraitBounds : bounds;

    const fwd = !!forwardRef?.current;
    const back = !!backRef?.current;
    const forwardAxis = (fwd ? 1 : 0) + (back ? -1 : 0);

    let sx = Number(strafeRef?.current ?? 0);
    if (!Number.isFinite(sx)) sx = 0;

    if (sx === 0 && hasWindow) {
      const wX = Number(window.__JOY_X__ ?? 0);
      if (Number.isFinite(wX)) sx = wX;
    }
    const strafeAxis = clampAxis(sx);

    if (isMap) return;
    if (forwardAxis === 0 && strafeAxis === 0) return;

    camera.getWorldDirection(forwardDir.current);
    forwardDir.current.y = 0;
    forwardDir.current.normalize();

    rightDir.current.copy(forwardDir.current).cross(camera.up).normalize();

    moveVec.current.set(0, 0, 0);

    if (forwardAxis !== 0) {
      moveVec.current.addScaledVector(
        forwardDir.current,
        forwardAxis * speed * dt
      );
    }
    if (strafeAxis !== 0) {
      moveVec.current.addScaledVector(
        rightDir.current,
        strafeAxis * strafeSpeed * dt
      );
    }

    camera.position.add(moveVec.current);

    camera.position.x = Math.max(b.minX, Math.min(b.maxX, camera.position.x));
    camera.position.z = Math.max(b.minZ, Math.min(b.maxZ, camera.position.z));

    camera.position.x = Math.max(-10.6, Math.min(10.6, camera.position.x));

    if (enableShelfCollision) {
      const centers = [-6.2, 0, 6.2];
      const halfW = 2.35;
      const stopZ = -6.05;

      if (camera.position.z < stopZ) {
        const inside = centers.some(
          (cx) =>
            camera.position.x > cx - halfW && camera.position.x < cx + halfW
        );
        if (inside) camera.position.z = stopZ;
      }
    }
  });

  return null;
}
