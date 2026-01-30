import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import InteractiveItem from "./InteractiveItem";
import { SECTIONS } from "../data/sections";

const CHALK_FONT = "/fonts/Kalam-Regular.ttf";
const CHALK_COLOR = "#fbf7ee";

function makeChalkboardTexture(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#0e1713";
  ctx.fillRect(0, 0, size, size);

  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() * 14) | 0;
    img.data[i] = Math.min(255, img.data[i] + n);
    img.data[i + 1] = Math.min(255, img.data[i + 1] + n);
    img.data[i + 2] = Math.min(255, img.data[i + 2] + n);
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  ctx.globalAlpha = 0.1;
  for (let k = 0; k < 22; k++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 30 + Math.random() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) {
    const y = (i / 18) * size + (Math.random() - 0.5) * 6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  return tex;
}

export default function AboutPanel({
  onPick,
  enabled = true,
  position = [10.85, 2.6, -2.9],
  rotation = [0, -Math.PI / 2, 0],
  baseY,
}) {
  const groupRef = useRef();

  const baseYRef = useRef(
    typeof baseY === "number" ? baseY : Array.isArray(position) ? position[1] : 0
  );

  useEffect(() => {
    baseYRef.current =
      typeof baseY === "number"
        ? baseY
        : Array.isArray(position)
        ? position[1]
        : 0;
  }, [baseY, position]);

  useFrame(({ clock }) => {
    if (!enabled || !groupRef.current) return;

    const t = clock.getElapsedTime();
    groupRef.current.position.y = baseYRef.current + Math.sin(t * 0.8) * 0.01;

    const s = 1 + Math.sin(t * 0.9) * 0.0045;
    groupRef.current.scale.set(s, s, 1);
  });

  const OUT = 0.06;
  const W = 2.45;
  const H = 2.65;

  const about = SECTIONS.about;
  const title = about?.title || "À propos de moi";
  const description = about?.description || "";
  const tags = about?.tags || [];

  const lines = useMemo(() => {
    const paras = description
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const out = [];
    for (const p of paras) {
      out.push(p);
      out.push("");
    }
    if (out.length && out[out.length - 1] === "") out.pop();
    return out;
  }, [description]);

  const lineJitter = useMemo(() => {
    const seed = (n) => {
      const x = Math.sin(n * 999) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 24 }).map((_, i) => ({
      dx: (seed(i + 1) - 0.5) * 0.012,
      rot: (seed(i + 17) - 0.5) * 0.006,
      scale: 0.99 + seed(i + 33) * 0.015,
    }));
  }, []);

  const boardTex = useMemo(() => makeChalkboardTexture(512), []);

  const boardMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: boardTex,
      roughness: 0.98,
      metalness: 0.0,
    });
  }, [boardTex]);

  const woodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#3a2a1a"),
      roughness: 0.85,
      metalness: 0.05,
    });
  }, []);

  const titleY = H / 2 - 0.285;
  const textTopY = titleY - 0.28;
  const lineGap = 0.155;

  return (
    <group ref={groupRef} position={position} rotation={rotation} visible={enabled}>
      <mesh position={[0, 0, OUT]} raycast={() => null}>
        <boxGeometry args={[W + 0.14, H + 0.14, 0.04]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

      <mesh position={[0, 0, OUT + 0.03]} raycast={() => null}>
        <boxGeometry args={[W, H, 0.05]} />
        <primitive object={boardMat} attach="material" />
      </mesh>

      <mesh position={[0, H / 2 - 0.18, OUT + 0.06]} raycast={() => null}>
        <boxGeometry args={[W * 0.78, 0.3, 0.02]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

      <Text
        position={[0, titleY, OUT + 0.095]}
        font={CHALK_FONT}
        fontSize={0.115}
        maxWidth={W * 0.72}
        anchorX="center"
        anchorY="middle"
        color={CHALK_COLOR}
        outlineWidth={0.0045}
        outlineOpacity={0.16}
        outlineColor="#ffffff"
        raycast={() => null}
      >
        {title}
      </Text>

      {lines.slice(0, 9).map((t, i) => {
        if (t === "") return null;
        const j = lineJitter[i] || { dx: 0, rot: 0, scale: 1 };

        return (
          <Text
            key={i}
            position={[-W / 2 + 0.18 + j.dx, textTopY - i * lineGap, OUT + 0.095]}
            rotation={[0, 0, j.rot]}
            font={CHALK_FONT}
            fontSize={0.07 * j.scale}
            lineHeight={1.18}
            maxWidth={W * 0.88}
            anchorX="left"
            anchorY="top"
            color={CHALK_COLOR}
            outlineWidth={0.0035}
            outlineOpacity={0.12}
            outlineColor="#ffffff"
            raycast={() => null}
          >
            {t}
          </Text>
        );
      })}

      {tags.slice(0, 3).map((tg, i) => (
        <Text
          key={tg}
          position={[-W / 2 + 0.2 + i * 0.8, -H / 2 + 0.2, OUT + 0.095]}
          font={CHALK_FONT}
          fontSize={0.06}
          maxWidth={0.85}
          anchorX="left"
          anchorY="middle"
          color={CHALK_COLOR}
          outlineWidth={0.003}
          outlineOpacity={0.1}
          outlineColor="#ffffff"
          raycast={() => null}
        >
          {`• ${tg}`}
        </Text>
      ))}

      <InteractiveItem onPick={onPick}>
        <mesh position={[0, 0, OUT + 0.12]}>
          <boxGeometry args={[W + 0.55, H + 0.55, 0.25]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </InteractiveItem>
    </group>
  );
}








