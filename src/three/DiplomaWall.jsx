// src/three/DiplomaWall.jsx
import { useMemo, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import FrameInteractive from "./FrameInteractive";

function DiplomaFrameContent({ size = [1.8, 1.25], textureUrl }) {
  const diplomaTex = useTexture(textureUrl);

  useEffect(() => {
    if (!diplomaTex) return;
    diplomaTex.colorSpace = THREE.SRGBColorSpace;
    diplomaTex.anisotropy = 8;
    diplomaTex.wrapS = THREE.ClampToEdgeWrapping;
    diplomaTex.wrapT = THREE.ClampToEdgeWrapping;
    diplomaTex.needsUpdate = true;
  }, [diplomaTex]);

  const inkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1a22"),
        roughness: 0.8,
        metalness: 0.05,
      }),
    []
  );

  const paperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#e6dfd4"),
        roughness: 0.92,
        metalness: 0.0,
      }),
    []
  );

  const imageMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: diplomaTex,
        roughness: 0.95,
        metalness: 0.0,
        toneMapped: true,
      }),
    [diplomaTex]
  );

  return (
    <group>
      {/* ✅ Déco : raycast OFF (ne vole pas les clics) */}
      <mesh raycast={() => null}>
        <boxGeometry args={[size[0] + 0.12, size[1] + 0.12, 0.05]} />
        <primitive object={inkMat} attach="material" />
      </mesh>

      <mesh position={[0, 0, 0.035]} raycast={() => null}>
        <boxGeometry args={[size[0], size[1], 0.01]} />
        <primitive object={paperMat} attach="material" />
      </mesh>

      <mesh position={[0, 0, 0.055]} raycast={() => null}>
        <planeGeometry args={[size[0] * 0.98, size[1] * 0.98]} />
        <primitive object={imageMat} attach="material" />
      </mesh>
    </group>
  );
}

export default function DiplomaWall({ onPickDiplomas, activeIndex }) {
  const x = -10.75;
  const zList = [3.8, 1.1, -1.6, -4.3];
  const y = 2.85;

  const size = [1.8, 1.25];

  const diplomaTextures = [
    "/textures/diplomas/diplome-rncp.jpg",
    "/textures/diplomas/certif-ia.jpg",
    "/textures/diplomas/diplome-bts.jpg",
    "/textures/diplomas/bac.jpg",
  ];

  const separators = [
    (zList[0] + zList[1]) / 2,
    (zList[1] + zList[2]) / 2,
    (zList[2] + zList[3]) / 2,
  ];

  const selectedId =
    activeIndex == null ? null : `diploma-${activeIndex}`;

  return (
    <group>
      {/* ✅ Cadres interactifs */}
      {zList.map((z, i) => (
        <FrameInteractive
          key={i}
          id={`diploma-${i}`}
          selectedId={selectedId}
          onPick={() => onPickDiplomas?.(i)}
          position={[x, y, z]}
          rotation={[0, Math.PI / 2, 0]}
          pop={0.55} // avance (effet “zoom”)
          hitbox={[size[0] + 0.35, size[1] + 0.35, 0.35]}
          hitboxZ={0.12}
        >
          <DiplomaFrameContent size={size} textureUrl={diplomaTextures[i]} />
        </FrameInteractive>
      ))}

      {/* ✅ Séparateurs : déco => raycast OFF */}
      {separators.map((zMid, idx) => (
        <mesh
          key={`sep-${idx}`}
          position={[x, y, zMid]}
          rotation={[0, Math.PI / 2, 0]}
          raycast={() => null}
        >
          <boxGeometry args={[0.06, 1.35, 0.06]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
