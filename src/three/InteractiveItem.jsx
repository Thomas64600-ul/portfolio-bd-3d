import { useRef, useState } from "react";
import { useCursor } from "@react-three/drei";

export default function InteractiveItem({
  children,
  onPick,
  disabled = false,
  allowWhenUIActive = false,
  allowWhileJoystickActive = false,
}) {
  const [hovered, setHovered] = useState(false);

  const down = useRef({
    x: 0,
    y: 0,
    id: null,
    moved: false,
    pointerType: null,
    captured: false,
  });

  const didPickRef = useRef(false);

  const DRAG_PX_MOUSE = 10;
  const DRAG_PX_TOUCH = 22;

  useCursor(hovered && !disabled);

  const isTouchLooking = () => {
    if (typeof window === "undefined") return false;
    return !!window.__TOUCH_LOOKING__ || !!window.__TOUCH_LOOKING_COOLDOWN__;
  };

  const isJoystickOrUIActive = () => {
    if (typeof window === "undefined") return false;

    const joy = !!window.__JOYSTICK_ACTIVE__;
    const ui = !!window.__UI_ACTIVE__;

    if (allowWhileJoystickActive) {
      return allowWhenUIActive ? false : ui; 
    }
    if (allowWhenUIActive) {
      return joy; 
    }
    return joy || ui;
  };

  const markInteracting = (pid) => {
    if (typeof window === "undefined") return;
    window.__INTERACTING__ = true;
    window.__INTERACTING_PID__ = pid ?? null;
    window.__INTERACTING_TS__ = Date.now();
  };

  const clearInteracting = () => {
    if (typeof window === "undefined") return;
    window.__INTERACTING__ = false;
    window.__INTERACTING_PID__ = null;
  };

  const canPickNow = () =>
    !disabled && !isTouchLooking() && !isJoystickOrUIActive();

  const resetDown = () => {
    down.current = {
      x: 0,
      y: 0,
      id: null,
      moved: false,
      pointerType: null,
      captured: false,
    };
  };

  function handleOver(e) {
    e.stopPropagation();
    if (!disabled) setHovered(true);
  }

  function handleOut(e) {
    e.stopPropagation();
    setHovered(false);
  }

  function handleDown(e) {
    e.stopPropagation();
    if (!canPickNow()) return;

    
    markInteracting(e.pointerId);

    didPickRef.current = false;

    const pointerType = e.pointerType || "mouse";

    down.current = {
      x: e.clientX ?? 0,
      y: e.clientY ?? 0,
      id: e.pointerId ?? null,
      moved: false,
      pointerType,
      captured: false,
    };

    try {
      if (e.pointerId != null && e.target?.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
        down.current.captured = true;
      }
    } catch {
      // ignore
    }
  }

  function handleMove(e) {
    if (down.current.id == null) return;
    if (e.pointerId !== down.current.id) return;

    const dx = Math.abs((e.clientX ?? 0) - down.current.x);
    const dy = Math.abs((e.clientY ?? 0) - down.current.y);

    const thr =
      down.current.pointerType === "touch" ? DRAG_PX_TOUCH : DRAG_PX_MOUSE;

    if (dx + dy > thr) down.current.moved = true;
  }

  function tryPick(e) {
    if (!canPickNow()) return;
    if (didPickRef.current) return;

    const hadDown = down.current.id != null;
    const samePointer = hadDown ? e.pointerId === down.current.id : true;

    if (hadDown && samePointer && !down.current.moved) {
      didPickRef.current = true;
      onPick?.(e);
    }
  }

  function handleUp(e) {
    e.stopPropagation();
    tryPick(e);

    
    clearInteracting();

    try {
      if (
        down.current.captured &&
        e.pointerId != null &&
        e.target?.releasePointerCapture
      ) {
        e.target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    resetDown();
  }

  function handleCancel(e) {
    e?.stopPropagation?.();

    
    clearInteracting();

    try {
      if (
        down.current.captured &&
        down.current.id != null &&
        e?.target?.releasePointerCapture
      ) {
        e.target.releasePointerCapture(down.current.id);
      }
    } catch {
      // ignore
    }

    resetDown();
    didPickRef.current = false;
  }

  function handleClick(e) {
    e.stopPropagation();
    if (didPickRef.current) return;
    if (!canPickNow()) return;
    if (down.current.moved) return;

    didPickRef.current = true;
    onPick?.(e);

    clearInteracting();
    resetDown();
  }

  return (
    <group
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      onPointerLeave={handleCancel}
      onClick={handleClick}
    >
      <group scale={hovered && !disabled ? 1.03 : 1.0}>{children}</group>
    </group>
  );
}

