import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export default function MobileJoystick({
  enabled = true,
  size = 120,
  deadZone = 0.12,
  onMove,
  onEnd,
}) {
  const radius = size / 2;
  const knobSize = Math.round(size * 0.46);
  const knobRadius = knobSize / 2;

  const baseRef = useRef(null);
  const pointerIdRef = useRef(null);

  const onMoveRef = useRef(onMove);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onMoveRef.current = onMove;
    onEndRef.current = onEnd;
  }, [onMove, onEnd]);

  const [active, setActive] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const emit = useCallback(
    (dx, dy) => {
      const max = radius - knobRadius;

      let x = dx / max;
      let y = dy / max;

      x = Math.max(-1, Math.min(1, x));
      y = Math.max(-1, Math.min(1, y));

      const mag = Math.hypot(x, y);
      if (mag < deadZone) {
        x = 0;
        y = 0;
      }

      onMoveRef.current?.({ x, y });
    },
    [deadZone, radius, knobRadius]
  );

  const reset = useCallback(() => {
    setActive(false);
    setKnob({ x: 0, y: 0 });
    pointerIdRef.current = null;

    if (typeof window !== "undefined") window.__JOYSTICK_ACTIVE__ = false;

    onEndRef.current?.();
    onMoveRef.current?.({ x: 0, y: 0 });
  }, []);

  const hardReset = useCallback(() => {
    if (typeof window !== "undefined") window.__JOYSTICK_ACTIVE__ = false;
    reset();
  }, [reset]);

  useEffect(() => {
    if (!enabled) reset();
  }, [enabled, reset]);

  useEffect(() => () => reset(), [reset]);

  const clampToCircle = useCallback(
    (dx, dy) => {
      const max = radius - knobRadius;
      const dist = Math.hypot(dx, dy);
      if (dist <= max) return { dx, dy };

      const k = max / Math.max(0.0001, dist);
      return { dx: dx * k, dy: dy * k };
    },
    [radius, knobRadius]
  );

  const styles = useMemo(
    () => ({
      wrap: {
        position: "absolute",
        left: 14,
        bottom: 86,
        zIndex: 30,
        width: size,
        height: size,
        pointerEvents: enabled ? "auto" : "none",
      },
      base: {
        width: "100%",
        height: "100%",
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(8px)",
        position: "relative",
        touchAction: "none",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      },
      knob: {
        width: knobSize,
        height: knobSize,
        borderRadius: 999,
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        transition: active ? "none" : "transform 140ms ease-out",
        background: active
          ? "rgba(255,255,255,0.18)"
          : "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        pointerEvents: "none",
      },
      label: {
        position: "absolute",
        left: "50%",
        bottom: -22,
        transform: "translateX(-50%)",
        fontSize: 12,
        color: "rgba(255,255,255,0.70)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        userSelect: "none",
        WebkitUserSelect: "none",
      },
    }),
    [active, knob.x, knob.y, knobSize, enabled, size]
  );

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const getLocal = (e) => {
      const r = base.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return { dx: e.clientX - cx, dy: e.clientY - cy };
    };

    const onPointerDown = (e) => {
      if (!enabled) return;

      e.stopPropagation?.();
      e.preventDefault?.();

      if (typeof window !== "undefined") window.__JOYSTICK_ACTIVE__ = true;

      pointerIdRef.current = e.pointerId;
      base.setPointerCapture?.(e.pointerId);

      setActive(true);

      const { dx, dy } = getLocal(e);
      const c = clampToCircle(dx, dy);
      setKnob({ x: c.dx, y: c.dy });
      emit(c.dx, c.dy);
    };

    const onPointerMove = (e) => {
      if (!enabled) return;
      if (pointerIdRef.current == null) return;
      if (e.pointerId !== pointerIdRef.current) return;

      e.stopPropagation?.();
      e.preventDefault?.();

      const { dx, dy } = getLocal(e);
      const c = clampToCircle(dx, dy);
      setKnob({ x: c.dx, y: c.dy });
      emit(c.dx, c.dy);
    };

    const onPointerUp = (e) => {
      if (pointerIdRef.current == null) return;
      if (e.pointerId !== pointerIdRef.current) return;

      e.stopPropagation?.();
      e.preventDefault?.();
      reset();
    };

    const onPointerCancel = (e) => {
      if (pointerIdRef.current == null) return;
      if (e.pointerId !== pointerIdRef.current) return;

      e.stopPropagation?.();
      e.preventDefault?.();
      reset();
    };

    const onLost = () => {
      if (pointerIdRef.current != null) reset();
      if (typeof window !== "undefined") {
  window.__JOY_X__ = 0;
  window.__JOY_Y__ = 0;
}

    };

    const onContextMenu = (e) => {
      e.preventDefault?.();
      e.stopPropagation?.();
    };

    base.addEventListener("pointerdown", onPointerDown, { passive: false });
    base.addEventListener("pointermove", onPointerMove, { passive: false });
    base.addEventListener("pointerup", onPointerUp, { passive: false });
    base.addEventListener("pointercancel", onPointerCancel, { passive: false });
    base.addEventListener("lostpointercapture", onLost, { passive: true });
    base.addEventListener("contextmenu", onContextMenu);

    return () => {
      base.removeEventListener("pointerdown", onPointerDown);
      base.removeEventListener("pointermove", onPointerMove);
      base.removeEventListener("pointerup", onPointerUp);
      base.removeEventListener("pointercancel", onPointerCancel);
      base.removeEventListener("lostpointercapture", onLost);
      base.removeEventListener("contextmenu", onContextMenu);
    };
  }, [enabled, clampToCircle, emit, reset]);

  useEffect(() => {
    if (!enabled) return;

    const onWinUp = () => {
      if (pointerIdRef.current != null) hardReset();
    };

    const onBlur = () => {
      if (pointerIdRef.current != null) hardReset();
    };

    const onVis = () => {
      if (document.visibilityState !== "visible" && pointerIdRef.current != null) {
        hardReset();
      }
    };

    window.addEventListener("pointerup", onWinUp, { passive: true });
    window.addEventListener("pointercancel", onWinUp, { passive: true });
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled, hardReset]);

  return (
    <div style={styles.wrap}>
      <div ref={baseRef} style={styles.base} aria-label="Joystick mobile">
        <div style={styles.knob} />
      </div>
      <div style={styles.label}>Déplacement</div>
    </div>
  );
}
