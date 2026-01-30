// src/three/StylizedCeiling.jsx
import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

export default function StylizedCeiling({
  y = 4.6,
  width = 22,
  depth = 18,
  panelThickness = 0.05,
  beamCount = 6,
  beamThickness = 0.22,
  beamHeight = 0.26,

  // ✅ Réglages texture plafond
  textureUrl = "/textures/plaster_ceiling.jpg",
  repeatX = 4,
  repeatZ = 3,
  ceilingTint = "#d2c9bc", // léger ton chaud “plâtre”
}) {
  // ✅ Texture plafond
  const ceilingMap = useLoader(THREE.TextureLoader, textureUrl);

  // ✅ Configure texture (seamless / répétition / filtrage)
  useMemo(() => {
    if (!ceilingMap) return;

    ceilingMap.wrapS = ceilingMap.wrapT = THREE.RepeatWrapping;
    ceilingMap.repeat.set(repeatX, repeatZ);

    // Bon rendu, moins de scintillement
    ceilingMap.anisotropy = 8;
    ceilingMap.minFilter = THREE.LinearMipmapLinearFilter;
    ceilingMap.magFilter = THREE.LinearFilter;

    // sRGB pour textures “color” (selon setup three/r3f)
    if ("colorSpace" in ceilingMap) ceilingMap.colorSpace = THREE.SRGBColorSpace;
    else ceilingMap.encoding = THREE.sRGBEncoding;

    ceilingMap.needsUpdate = true;
  }, [ceilingMap, repeatX, repeatZ]);

  // ✅ Matériau plafond réaliste (plâtre/enduit)
  const panelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: ceilingMap,
        color: new THREE.Color(ceilingTint),
        roughness: 0.95,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    [ceilingMap, ceilingTint]
  );

  // ✅ Matériau poutres (inchangé, joli)
  const beamMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#4a2f20"),
        roughness: 0.85,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    []
  );

  // ✅ Positions X des poutres
  const beams = useMemo(() => {
    const xs = [];
    for (let i = 0; i < beamCount; i++) {
      const t = beamCount === 1 ? 0.5 : i / (beamCount - 1);
      xs.push(THREE.MathUtils.lerp(-width / 2 + 0.9, width / 2 - 0.9, t));
    }
    return xs;
  }, [beamCount, width]);

  return (
    <group position={[0, y, 0]}>
      {/* Panneau plafond texturé */}
      <mesh position={[0, panelThickness / 2, 0]} material={panelMat}>
        <boxGeometry args={[width, panelThickness, depth]} />
      </mesh>

      {/* Poutres */}
      {beams.map((x, i) => (
        <mesh
          key={i}
          position={[x, -(beamHeight / 2) - 0.06, 0]}
          material={beamMat}
        >
          <boxGeometry args={[beamThickness, beamHeight, depth - 0.2]} />
        </mesh>
      ))}
    </group>
  );
}

