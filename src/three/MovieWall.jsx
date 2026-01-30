import * as THREE from "three";
import { useMemo, useEffect } from "react";
import { useTexture } from "@react-three/drei";

function Poster({ texture, position, w = 1.15, h = 1.7 }) {
  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function Logo({ texture, position, w = 2.2, h = 2.2 }) {
  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.35}
        roughness={0.9}
        metalness={0}
        depthWrite={false}
        emissive={new THREE.Color("#ffd400")}
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}

export default function MovieWall({
  position = [0, 2.35, 7.78],
  posterW = 1.15,
  posterH = 1.7,
  gapX = 0.85,
  gapY = 0.55,
  zOffset = 0.03,

  logoPath = "/textures/logo/portfolio-thomas.png",
  logoZ = 0.06,

  middleGap = 0.8,
  outerGap = 1.2,


  beamNudge = 0.8,
}) {
  const posters = useTexture([
    "/textures/posters/cite-de-dieu.jpg",
    "/textures/posters/pulp-fiction.jpg",
    "/textures/posters/godfather.jpg",
    "/textures/posters/big-lebowski.jpg",

    "/textures/posters/alien.jpg",
    "/textures/posters/apocalypsenow.jpg",
    "/textures/posters/exorcist.jpg",
    "/textures/posters/fightclub.jpg",

    "/textures/posters/terminator-2.jpg",
    "/textures/posters/platoon.jpg",
    "/textures/posters/back-to-the-future-2.jpg",
    "/textures/posters/gladiator.jpg",

    "/textures/posters/jaws.jpg",
    "/textures/posters/onceuponatimeinwest.jpg",
    "/textures/posters/orangemecanique.jpg",
    "/textures/posters/scarface.jpg",
  ]);

  const logoTex = useTexture(logoPath);

  useEffect(() => {
    const all = [...(posters || []), logoTex].filter(Boolean);

    all.forEach((t) => {
      
      t.colorSpace = THREE.SRGBColorSpace;

      t.anisotropy = 8;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.needsUpdate = true;
    });
  }, [posters, logoTex]);

  const block2x2 = useMemo(() => {
    const stepX = posterW + gapX;
    const stepY = posterH + gapY;
    const xs = [-stepX / 2, stepX / 2];
    const ys = [stepY / 2, -stepY / 2];
    return [
      [xs[0], ys[0], zOffset],
      [xs[1], ys[0], zOffset],
      [xs[0], ys[1], zOffset],
      [xs[1], ys[1], zOffset],
    ];
  }, [posterW, posterH, gapX, gapY, zOffset]);

  const galleryHeight = useMemo(() => posterH * 2 + gapY, [posterH, gapY]);
  const bigLogoH = useMemo(() => galleryHeight * 1.1, [galleryHeight]);
  const bigLogoW = bigLogoH;

  const blockWidth = useMemo(() => posterW + gapX, [posterW, gapX]);

  const nearOffsetX = useMemo(
    () => blockWidth / 2 + bigLogoW / 2 + middleGap,
    [blockWidth, bigLogoW, middleGap]
  );

  const farOffsetX = useMemo(
    () => nearOffsetX + blockWidth + outerGap,
    [nearOffsetX, blockWidth, outerGap]
  );

  const farAlignedX = useMemo(
    () => farOffsetX + beamNudge,
    [farOffsetX, beamNudge]
  );

  const leftNear = posters.slice(0, 4);
  const leftFar = posters.slice(4, 8);
  const rightNear = posters.slice(8, 12);
  const rightFar = posters.slice(12, 16);

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      {leftNear.map((tex, i) => (
        <Poster
          key={`LN-${i}`}
          texture={tex}
          position={[
            block2x2[i][0] - nearOffsetX,
            block2x2[i][1],
            block2x2[i][2],
          ]}
          w={posterW}
          h={posterH}
        />
      ))}

      {leftFar.map((tex, i) => (
        <Poster
          key={`LF-${i}`}
          texture={tex}
          position={[
            block2x2[i][0] - farAlignedX,
            block2x2[i][1],
            block2x2[i][2],
          ]}
          w={posterW}
          h={posterH}
        />
      ))}

      <Logo
        texture={logoTex}
        position={[0, 0, logoZ]}
        w={bigLogoW}
        h={bigLogoH}
      />

      {rightNear.map((tex, i) => (
        <Poster
          key={`RN-${i}`}
          texture={tex}
          position={[
            block2x2[i][0] + nearOffsetX,
            block2x2[i][1],
            block2x2[i][2],
          ]}
          w={posterW}
          h={posterH}
        />
      ))}

      {rightFar.map((tex, i) => (
        <Poster
          key={`RF-${i}`}
          texture={tex}
          position={[
            block2x2[i][0] + farAlignedX,
            block2x2[i][1],
            block2x2[i][2],
          ]}
          w={posterW}
          h={posterH}
        />
      ))}

      <spotLight
        position={[0, 2.2, 2]}
        angle={0.5}
        penumbra={0.95}
        intensity={0.45}
        distance={12}
        color="#ffd2a6"
      />
    </group>
  );
}

