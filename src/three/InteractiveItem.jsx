import { useRef, useState } from "react";
import { useCursor } from "@react-three/drei";

export default function InteractiveItem({
  children,
  onPick,
  disabled = false,
  allowWhenUIActive = false,
}) {
  const [hovered, setHovered] = useState(false);

  const down = useRef({ x: 0, y: 0, id: null, moved: false });
  const didPickRef = useRef(false);

  const DRAG_PX = 10;

  useCursor(hovered && !disabled);

  const isTouchLooking = () => {
    if (typeof window === "undefined") return false;
    return !!window.__TOUCH_LOOKING__ || !!window.__TOUCH_LOOKING_COOLDOWN__;
  };

  const isJoystickOrUIActive = () => {
    if (typeof window === "undefined") return false;

    if (allowWhenUIActive) return !!window.__JOYSTICK_ACTIVE__;
    return !!window.__JOYSTICK_ACTIVE__ || !!window.__UI_ACTIVE__;
  };

  const canPickNow = () => !disabled && !isTouchLooking() && !isJoystickOrUIActive();

  const resetDown = () => {
    down.current = { x: 0, y: 0, id: null, moved: false };
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

    didPickRef.current = false;

    down.current = {
      x: e.clientX ?? 0,
      y: e.clientY ?? 0,
      id: e.pointerId ?? null,
      moved: false,
    };
  }

  function handleMove(e) {
    if (down.current.id == null) return;
    if (e.pointerId !== down.current.id) return;

    const dx = Math.abs((e.clientX ?? 0) - down.current.x);
    const dy = Math.abs((e.clientY ?? 0) - down.current.y);
    if (dx + dy > DRAG_PX) down.current.moved = true;
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
    resetDown();
  }

  function handleCancel(e) {
    e?.stopPropagation?.();
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
