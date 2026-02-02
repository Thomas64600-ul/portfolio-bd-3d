import { useRef, useState, useCallback } from "react";
import { useCursor } from "@react-three/drei";

export default function InteractiveItem({ children, onPick }) {
  const [hovered, setHovered] = useState(false);

  const down = useRef({ x: 0, y: 0, id: null, moved: false });
  const DRAG_PX = 10;

  useCursor(hovered);

  const isTouchLooking = () => {
    if (typeof window === "undefined") return false;
    
    return !!window.__TOUCH_LOOKING__;
  };

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handleOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
  }, []);

  const handleDown = useCallback((e) => {
    e.stopPropagation();

    if (isTouchLooking()) return;

    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    down.current = {
      x: e.clientX ?? 0,
      y: e.clientY ?? 0,
      id: e.pointerId ?? null,
      moved: false,
    };
  }, []);

  const handleMove = useCallback((e) => {
   
    const dx = Math.abs((e.clientX ?? 0) - down.current.x);
    const dy = Math.abs((e.clientY ?? 0) - down.current.y);
    if (dx + dy > DRAG_PX) down.current.moved = true;
  }, []);

  const handleUp = useCallback((e) => {
    e.stopPropagation();
   
  }, []);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();

      if (isTouchLooking()) return;

      if (down.current.moved) return;

      onPick?.();
    },
    [onPick]
  );

  return (
    <group
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onClick={handleClick}
    >
      <group scale={hovered ? 1.03 : 1.0}>{children}</group>
    </group>
  );
}


