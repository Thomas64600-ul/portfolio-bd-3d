import { useRef, useState } from "react";
import { useCursor } from "@react-three/drei";

export default function InteractiveItem({ children, onPick, disabled = false }) {
  const [hovered, setHovered] = useState(false);

  const down = useRef({ x: 0, y: 0, id: null, moved: false });
  const DRAG_PX = 10;

  useCursor(hovered && !disabled);

  const isTouchLooking = () => {
    if (typeof window === "undefined") return false;
    return !!window.__TOUCH_LOOKING__;
  };

  const isJoystickActive = () => {
    if (typeof window === "undefined") return false;
    return !!window.__JOYSTICK_ACTIVE__;
  };

  const canPickNow = () => !disabled && !isTouchLooking() && !isJoystickActive();

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
    if (e.preventDefault) e.preventDefault();
    if (!canPickNow()) return;

    // Pointer capture (safe)
    const target = e.currentTarget;
    if (target && typeof target.setPointerCapture === "function") {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

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

  function handleUp(e) {
    e.stopPropagation();
    // On ne déclenche rien ici : on laisse `onClick` gérer, mais
    // on s’assure que si l’utilisateur a “drag”, ça ne pick pas.
  }

  function handleClick(e) {
    e.stopPropagation();
    if (!canPickNow()) return;
    if (down.current.moved) return;

    onPick?.(e);
  }

  return (
    <group
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onClick={handleClick}
    >
      <group scale={hovered && !disabled ? 1.03 : 1.0}>{children}</group>
    </group>
  );
}
