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
    const yy = (i / 18) * size + (Math.random() - 0.5) * 6;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(size, yy + (Math.random() - 0.5) * 3);
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
  
  isMobile = false,
  isPortrait = false,
}) {
  const groupRef = useRef();

  const baseYRef = useRef(
    typeof baseY === "number" ? baseY : Array.isArray(position) ? position[1] : 0
  );

  useEffect(() => {
    baseYRef.current =
      typeof baseY === "number" ? baseY : Array.isArray(position) ? position[1] : 0;
  }, [baseY, position]);

  const portraitMode = Boolean(isMobile && isPortrait);

  useFrame(({ clock }) => {
    if (!enabled || !groupRef.current) return;

    const t = clock.getElapsedTime();
    groupRef.current.position.y = baseYRef.current + Math.sin(t * 0.8) * 0.01;

    const s = 1 + Math.sin(t * 0.9) * 0.0045;
    groupRef.current.scale.set(s, s, 1);
  });

  
  const OUT = 0.06;
  const W = 2.55;
  const H = 2.85;

 
  const panelScale = portraitMode ? 0.78 : 1;

  const about = SECTIONS.about;
  const title = about?.title || "À propos de moi";
  const description = about?.description || "";
  const tags = Array.isArray(about?.tags) ? about.tags : [];

 
  const boardTex = useMemo(() => makeChalkboardTexture(512), []);
  const boardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: boardTex,
        roughness: 0.98,
        metalness: 0.0,
      }),
    [boardTex]
  );

  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#3a2a1a"),
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  );

  
  const titleY = H / 2 - 0.30;
  const textTopY = titleY - 0.34;

 
  const bodyFontSize = portraitMode ? 0.060 : 0.064;
  const bodyLineHeight = portraitMode ? 1.18 : 1.20;

  const outlineTitle = portraitMode ? 0.0062 : 0.0045;
  const outlineText = portraitMode ? 0.0044 : 0.0032;

  
  const bodyMaxWidth = W * 0.92;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      visible={enabled}
      scale={[panelScale, panelScale, 1]}
    >
    
      <mesh position={[0, 0, OUT]} raycast={() => null}>
        <boxGeometry args={[W + 0.14, H + 0.14, 0.04]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

     
      <mesh position={[0, 0, OUT + 0.03]} raycast={() => null}>
        <boxGeometry args={[W, H, 0.05]} />
        <primitive object={boardMat} attach="material" />
      </mesh>

    
      <mesh position={[0, H / 2 - 0.20, OUT + 0.06]} raycast={() => null}>
        <boxGeometry args={[W * 0.82, 0.32, 0.02]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

     
      {portraitMode && (
        <mesh position={[0, 0.04, OUT + 0.085]} raycast={() => null}>
          <boxGeometry args={[W * 0.96, H * 0.80, 0.01]} />
          <meshBasicMaterial
            transparent
            opacity={0.18}
            color="#000000"
            depthWrite={false}
          />
        </mesh>
      )}

    
      <Text
        position={[0, titleY, OUT + 0.095]}
        font={CHALK_FONT}
        fontSize={portraitMode ? 0.125 : 0.11}
        maxWidth={W * 0.80}
        anchorX="center"
        anchorY="middle"
        color={CHALK_COLOR}
        outlineWidth={outlineTitle}
        outlineOpacity={portraitMode ? 0.2 : 0.16}
        outlineColor="#ffffff"
        raycast={() => null}
      >
        {title}
      </Text>

     
      <Text
        position={[-W / 2 + 0.18, textTopY, OUT + 0.095]}
        font={CHALK_FONT}
        fontSize={bodyFontSize}
        lineHeight={bodyLineHeight}
        maxWidth={bodyMaxWidth}
        anchorX="left"
        anchorY="top"
        color={CHALK_COLOR}
        outlineWidth={outlineText}
        outlineOpacity={portraitMode ? 0.16 : 0.12}
        outlineColor="#ffffff"
        raycast={() => null}
      >
        {description}
      </Text>

      
      {tags.slice(0, 3).map((tg, i) => (
        <Text
          key={tg}
          position={[
            -W / 2 + 0.2 + i * 0.86,
            portraitMode ? -H / 2 + 0.28 : -H / 2 + 0.20,
            OUT + 0.095,
          ]}
          font={CHALK_FONT}
          fontSize={portraitMode ? 0.062 : 0.058}
          maxWidth={0.9}
          anchorX="left"
          anchorY="middle"
          color={CHALK_COLOR}
          outlineWidth={portraitMode ? 0.0036 : 0.003}
          outlineOpacity={portraitMode ? 0.14 : 0.1}
          outlineColor="#ffffff"
          raycast={() => null}
        >
          {`• ${tg}`}
        </Text>
      ))}

     
      <InteractiveItem onPick={onPick}>
        <mesh position={[0, 0, OUT + 0.11]}>
          <boxGeometry args={[W + 0.35, H + 0.35, 0.18]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} depthTest={false} />
        </mesh>
      </InteractiveItem>
    </group>
  );
}










