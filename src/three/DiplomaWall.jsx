import { useMemo, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import FrameInteractive from "./FrameInteractive";

const SIZE = [1.8, 1.25];
const X = -10.75;
const Y = 2.85;
const Z_LIST = [3.8, 1.1, -1.6, -4.3];

const DIPLOMA_TEXTURES = [
  "/textures/diplomas/diplome-rncp.webp",
  "/textures/diplomas/certif-ia.webp",
  "/textures/diplomas/diplome-bts.webp",
  "/textures/diplomas/bac.webp",
];

function DiplomaFrameContent({ size = SIZE, textureUrl }) {
  const diplomaTex = useTexture(textureUrl);

  useEffect(() => {
    if (!diplomaTex) return;

    
    diplomaTex.colorSpace = THREE.SRGBColorSpace;

   
    diplomaTex.anisotropy = 12;
    diplomaTex.minFilter = THREE.LinearMipmapLinearFilter;
    diplomaTex.magFilter = THREE.LinearFilter;
    diplomaTex.generateMipmaps = true;

   
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
        color: new THREE.Color("#f0eadf"),
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  );

  const imageMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: diplomaTex,
        roughness: 0.82,
        metalness: 0.0,
        toneMapped: true,
        
        color: new THREE.Color("#e2e2e2"),
      
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0.05,
      }),
    [diplomaTex]
  );

  return (
    <group>
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
  const separators = useMemo(
    () => [
      (Z_LIST[0] + Z_LIST[1]) / 2,
      (Z_LIST[1] + Z_LIST[2]) / 2,
      (Z_LIST[2] + Z_LIST[3]) / 2,
    ],
    []
  );

  const selectedId = activeIndex == null ? null : `diploma-${activeIndex}`;

  return (
    <group>
      {Z_LIST.map((z, i) => (
        <FrameInteractive
          key={i}
          id={`diploma-${i}`}
          selectedId={selectedId}
          onPick={() => onPickDiplomas?.(i)}
          position={[X, Y, z]}
          rotation={[0, Math.PI / 2, 0]}
          pop={0.55}
          hitbox={[SIZE[0] + 0.35, SIZE[1] + 0.35, 0.35]}
          hitboxZ={0.12}
        >
          <DiplomaFrameContent size={SIZE} textureUrl={DIPLOMA_TEXTURES[i]} />
        </FrameInteractive>
      ))}

      {separators.map((zMid, idx) => (
        <mesh
          key={`sep-${idx}`}
          position={[X, Y, zMid]}
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

