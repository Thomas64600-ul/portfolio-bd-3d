import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

function ensureUv2(geo) {
  if (!geo?.attributes?.uv) return;
  if (geo.attributes.uv2) return;
  geo.setAttribute("uv2", new THREE.BufferAttribute(geo.attributes.uv.array, 2));
}

export default function StylizedCeiling({
  y = 4.6,
  width = 22,
  depth = 18,
  panelThickness = 0.05,

  beamCount = 6,
  beamThickness = 0.22,
  beamHeight = 0.26,

  
  pbrBasePath = "/textures/ceiling",

  repeatX = 3,
  repeatZ = 2,

 
  ceilingTint = "#d2c9bc",

  
  aoIntensity = 0.65,
  normalStrength = 0.5,
  roughness = 0.92,
}) {
  const { gl } = useThree();

  const maps = useTexture({
    map: `${pbrBasePath}/diff.webp`,
    aoMap: `${pbrBasePath}/ao.webp`,
    normalMap: `${pbrBasePath}/normal.webp`,
    roughnessMap: `${pbrBasePath}/rough.webp`,
  });

  useEffect(() => {
    const maxAniso = gl?.capabilities?.getMaxAnisotropy
      ? gl.capabilities.getMaxAnisotropy()
      : 8;

    const apply = (tex, isColor) => {
      if (!tex) return;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatZ);

      tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;

      tex.anisotropy = Math.min(16, maxAniso);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;

      tex.needsUpdate = true;
    };

    apply(maps.map, true);
    apply(maps.aoMap, false);
    apply(maps.normalMap, false);
    apply(maps.roughnessMap, false);
  }, [maps, repeatX, repeatZ, gl]);

  const panelMat = useMemo(() => {
    const ns = new THREE.Vector2(normalStrength, normalStrength);

    return new THREE.MeshStandardMaterial({
      map: maps.map,
      aoMap: maps.aoMap,
      aoMapIntensity: aoIntensity,
      normalMap: maps.normalMap,
      normalScale: ns,
      roughnessMap: maps.roughnessMap,
      roughness,
      metalness: 0.0,
      color: new THREE.Color(ceilingTint),
      side: THREE.DoubleSide,
    });
  }, [maps, ceilingTint, aoIntensity, normalStrength, roughness]);

  const beamMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#4a2f20"),
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
  }, []);

  const beams = useMemo(() => {
    const xs = [];
    for (let i = 0; i < beamCount; i++) {
      const t = beamCount === 1 ? 0.5 : i / (beamCount - 1);
      xs.push(THREE.MathUtils.lerp(-width / 2 + 0.9, width / 2 - 0.9, t));
    }
    return xs;
  }, [beamCount, width]);

  const panelGeoRef = useRef(null);

  useEffect(() => {
    if (panelGeoRef.current) ensureUv2(panelGeoRef.current);
  }, []);

  return (
    <group position={[0, y, 0]}>
     
      <mesh position={[0, panelThickness / 2, 0]} material={panelMat}>
        <boxGeometry ref={panelGeoRef} args={[width, panelThickness, depth]} />
      </mesh>

     
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
