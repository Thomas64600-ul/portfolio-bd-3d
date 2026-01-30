// src/three/InteractiveItem.jsx
import { useRef, useState } from "react";
import { useCursor } from "@react-three/drei";

export default function InteractiveItem({ children, onPick }) {
  const [hovered, setHovered] = useState(false);
  const down = useRef({ x: 0, y: 0, id: null });

  useCursor(hovered);

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();

        // ✅ capture le pointeur (fiable même si pointer lock / sorties de zone)
        try {
          e.target.setPointerCapture?.(e.pointerId);
        } catch {
          // ignore
        }

        down.current = { x: e.clientX ?? 0, y: e.clientY ?? 0, id: e.pointerId };
      }}
      onClick={(e) => {
        // ✅ CLICK = le plus fiable en R3F (marche avec pointer lock)
        e.stopPropagation();
        onPick?.();
      }}
      onPointerUp={(e) => {
        // ✅ garde une logique anti-drag si tu veux bouger la caméra sans déclencher
        e.stopPropagation();

        const dx = Math.abs((e.clientX ?? 0) - down.current.x);
        const dy = Math.abs((e.clientY ?? 0) - down.current.y);
        const dragged = dx + dy > 10;

        // Si tu préfères NE PAS déclencher sur click quand drag => tu peux commenter onClick
        // et décommenter ça :
        // if (!dragged) onPick?.();

        // Là on laisse onClick faire le job, et on ne fait rien ici.
        // (évite les doubles déclenchements)
        void dragged;
      }}
    >
      <group scale={hovered ? 1.03 : 1.0}>{children}</group>
    </group>
  );
}



