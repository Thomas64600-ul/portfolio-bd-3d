import { useMemo, useEffect, useCallback } from "react";
import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

import InteractiveItem from "./InteractiveItem";
import { FloorLabel, FloorArrow, WallWoodSign } from "./SceneLabels";

function BookcaseUnit({
  theme = "bd",
  walnutMat,
  onPickItem,
  onPickShelf,
  isMobile = false,
}) {
  const palette = useMemo(() => {
    if (theme === "comics") return ["#ffd166", "#ef476f", "#06d6a0", "#118ab2"];
    if (theme === "manga") return ["#f4f4f4", "#d9d9d9", "#a8a8a8", "#1f1f1f"];
    return ["#78d6ff", "#ff7a9a", "#e9d36b", "#7CFF8D"];
  }, [theme]);

  const label = theme === "comics" ? "COMICS" : theme === "manga" ? "MANGA" : "BD";
  const labelAccent =
    theme === "comics" ? "#ef476f" : theme === "manga" ? "#f4f4f4" : "#ff7a9a";

  const W = 4.6;
  const H = 2.9;
  const D = 0.78;

  const frameT = 0.16;
  const shelfT = 0.08;

  const frontZ = D / 2 - 0.02;
  const backZ = -D / 2 + 0.06;

  const bookZ = 0.165;

  const innerBackMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1310"),
        roughness: 0.85,
        metalness: 0.0,
      }),
    []
  );

  const mangaTextures = useLoader(THREE.TextureLoader, [
    "/textures/manga/dragonball.webp",
    "/textures/manga/aot.webp",
    "/textures/manga/sommet.webp",
    "/textures/manga/lastman.webp",
    "/textures/manga/gunnm.webp",
  ]);

  const comicsTextures = useLoader(THREE.TextureLoader, [
    "/textures/comics/300.webp",
    "/textures/comics/dc.webp",
    "/textures/comics/preacher.webp",
    "/textures/comics/sincity.webp",
    "/textures/comics/walkingdead.webp",
  ]);

  const bdTextures = useLoader(THREE.TextureLoader, [
    "/textures/bd/signe.webp",
    "/textures/bd/complainte.webp",
    "/textures/bd/jeremiah.webp",
    "/textures/bd/largo.webp",
    "/textures/bd/lesaigles.webp",
    "/textures/bd/lesvieux.webp",
    "/textures/bd/murena.webp",
  ]);

  useEffect(() => {
    const apply = (texList) => {
      const list = Array.isArray(texList) ? texList : [texList];
      list.forEach((t) => {
        if (!t) return;
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = isMobile ? 4 : 12;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = true;
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.ClampToEdgeWrapping;
        t.needsUpdate = true;
      });
    };

    apply(mangaTextures);
    apply(comicsTextures);
    apply(bdTextures);
  }, [mangaTextures, comicsTextures, bdTextures, isMobile]);

  const sliceTexture = useCallback(
    (baseTex, i, count, uStart = 0, uEnd = 1) => {
      if (!baseTex || !count) return null;

      const t = baseTex.clone();
      t.needsUpdate = true;

      const span = Math.max(0.0001, uEnd - uStart);
      const w = span / count;
      const pad = 0.0015 * span;

      t.repeat.set(Math.max(0.0001, w - pad), 1);
      t.offset.set(uStart + i * w + pad * 0.5, 0);

      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;

      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = isMobile ? 4 : 12;

      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;

      return t;
    },
    [isMobile]
  );

  const ROW_COUNTS = useMemo(() => [20, 18, 24], []);
  const rand01 = useCallback((n) => {
    const x = Math.sin(n * 999) * 10000;
    return x - Math.floor(x);
  }, []);

  function Book({ x, y, h, w, c, tilt = 0, variant = 0, spineTex }) {
    const isManga = theme === "manga";
    const isComics = theme === "comics";
    const isBD = theme === "bd";
    const hasSpine = !!spineTex && (isManga || isComics || isBD);

    const zNudge = isComics ? (variant % 2) * 0.002 : (variant % 3) * 0.004;
    const yNudge = (rand01(variant) - 0.5) * (isComics ? 0.006 : 0.012);
    const xNudge = (rand01(variant + 7) - 0.5) * (isComics ? 0.002 : 0.01);

    const band = isManga
      ? variant % 2
        ? "#111111"
        : "#2a2a2a"
      : palette[(variant + 1) % palette.length];

    const handlePick = () => onPickShelf?.();

    return (
      <InteractiveItem onPick={handlePick}>
        <group position={[x + xNudge, y + yNudge, bookZ + zNudge]} rotation={[0, 0, tilt]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, 0.07]} />
            <meshStandardMaterial
              color={isManga ? "#eaeaea" : isComics ? "#101010" : isBD ? "#e8e1d8" : c}
              roughness={isComics ? 0.9 : isBD ? 0.85 : 0.72}
              metalness={isComics ? 0.04 : 0.02}
            />
          </mesh>

          {hasSpine && (
            <mesh castShadow receiveShadow position={[0, 0, isBD ? 0.043 : 0.041]}>
              <planeGeometry args={[w * (isBD ? 0.96 : 0.92), h * (isBD ? 0.96 : 0.92)]} />
              {isComics ? (
                <meshPhysicalMaterial
                  map={spineTex}
                  roughness={0.78}
                  metalness={0.02}
                  clearcoat={0.45}
                  clearcoatRoughness={0.6}
                  polygonOffset
                  polygonOffsetFactor={-1}
                  polygonOffsetUnits={-1}
                />
              ) : (
                <meshStandardMaterial
                  map={spineTex}
                  roughness={isBD ? 0.65 : 0.86}
                  metalness={isBD ? 0.05 : 0.0}
                  emissive={isBD ? new THREE.Color("#000000") : undefined}
                  emissiveIntensity={0.15}
                  polygonOffset
                  polygonOffsetFactor={-1}
                  polygonOffsetUnits={-1}
                />
              )}
            </mesh>
          )}

          {!isManga && !isComics && !hasSpine && (
            <mesh position={[0, h * 0.28, 0.045]}>
              <boxGeometry args={[w * 0.86, h * 0.14, 0.012]} />
              <meshStandardMaterial color={band} roughness={0.55} metalness={0.01} />
            </mesh>
          )}

          {theme === "bd" && !hasSpine && (
            <mesh position={[0, -h * 0.32, 0.045]}>
              <boxGeometry args={[w * 0.7, h * 0.12, 0.012]} />
              <meshStandardMaterial color={"#f2f2f2"} roughness={0.6} />
            </mesh>
          )}
        </group>
      </InteractiveItem>
    );
  }

  function Row({ rowIndex, y, count, leftPad = 0.72, rightPad = 0.72, offset = 0 }) {
    const usable = W - leftPad - rightPad;
    const step = usable / count;

    const pickSlice = (baseTex, iInBlock, displayBlockCount, realCount, uStart = 0, uEnd = 1) => {
      const localIndex = Math.floor((iInBlock * realCount) / displayBlockCount);
      return sliceTexture(baseTex, localIndex, realCount, uStart, uEnd);
    };

    return (
      <group>
        {Array.from({ length: count }).map((_, i) => {
          const globalIndex = offset + i;
          const x = -W / 2 + leftPad + i * step + step * 0.5;

          const h = theme === "manga" ? 0.545 : theme === "comics" ? 0.59 : 0.62;
          const w = theme === "manga" ? step * 0.9 : theme === "comics" ? step * 0.86 : step * 0.88;

          const baseColor =
            theme === "manga"
              ? i % 2 === 0
                ? "#f2f2f2"
                : "#dcdcdc"
              : palette[i % palette.length];

          const tilt =
            theme === "comics"
              ? 0
              : i % 9 === 0
              ? 0.028
              : i % 13 === 0
              ? -0.022
              : i % 17 === 0
              ? 0.018
              : 0;

          let spineTex = null;

          if (theme === "manga") {
            const SERIES = { db: 34, aot: 11, sommet: 5, lastman: 12, gunnm: 9 };

            if (rowIndex === 2) spineTex = pickSlice(mangaTextures[0], i, count, SERIES.db);

            if (rowIndex === 1) {
              const total = SERIES.aot + SERIES.sommet;
              const aotBlock = Math.max(1, Math.round((count * SERIES.aot) / total));
              const sommetBlock = Math.max(1, count - aotBlock);

              if (i < aotBlock) spineTex = pickSlice(mangaTextures[1], i, aotBlock, SERIES.aot);
              else spineTex = pickSlice(mangaTextures[2], i - aotBlock, sommetBlock, SERIES.sommet);
            }

            if (rowIndex === 0) {
              const total = SERIES.lastman + SERIES.gunnm;
              const lastBlock = Math.max(1, Math.round((count * SERIES.lastman) / total));
              const gunnmBlock = Math.max(1, count - lastBlock);

              if (i < lastBlock) spineTex = pickSlice(mangaTextures[3], i, lastBlock, SERIES.lastman);
              else spineTex = pickSlice(mangaTextures[4], i - lastBlock, gunnmBlock, SERIES.gunnm);
            }
          }

          if (theme === "comics") {
            const SERIES = { t300: 1, dc: 10, preacher: 4, sincity: 7, walkingdead: 16 };

            if (rowIndex === 2) spineTex = pickSlice(comicsTextures[4], i, count, SERIES.walkingdead);
            if (rowIndex === 1) spineTex = pickSlice(comicsTextures[1], i, count, SERIES.dc);

            if (rowIndex === 0) {
              const preacherPart = 0.35;
              const sincityPart = 0.55;

              const preacherBlock = Math.max(1, Math.round(count * preacherPart));
              const sincityBlock = Math.max(1, Math.round(count * sincityPart));
              const used = preacherBlock + sincityBlock;
              const lastBlock = Math.max(1, count - used);

              if (i < preacherBlock) spineTex = pickSlice(comicsTextures[2], i, preacherBlock, SERIES.preacher);
              else if (i < preacherBlock + sincityBlock)
                spineTex = pickSlice(comicsTextures[3], i - preacherBlock, sincityBlock, SERIES.sincity);
              else spineTex = pickSlice(comicsTextures[0], 0, lastBlock, SERIES.t300);
            }
          }

          if (theme === "bd") {
            const SERIES = {
              signe: 32,
              complainte: 16,
              jeremiah: 7,
              largo: 25,
              aigles: 8,
              vieux: 8,
              murena: 13,
            };
            const TRIM = {
              signe: [0.02, 0.98],
              complainte: [0.06, 0.94],
              jeremiah: [0.06, 0.94],
              largo: [0.05, 0.95],
              aigles: [0.06, 0.94],
              vieux: [0.08, 0.92],
              murena: [0.06, 0.94],
            };

            if (rowIndex === 2) {
              const total = SERIES.largo + SERIES.signe;
              const largoBlock = Math.max(1, Math.round((count * SERIES.largo) / total));
              const signeBlock = Math.max(1, count - largoBlock);

              if (i < largoBlock) spineTex = pickSlice(bdTextures[3], i, largoBlock, SERIES.largo, ...TRIM.largo);
              else spineTex = pickSlice(bdTextures[0], i - largoBlock, signeBlock, SERIES.signe, ...TRIM.signe);
            }

            if (rowIndex === 1) {
              const total = SERIES.murena + SERIES.aigles;
              const murenaBlock = Math.max(1, Math.round((count * SERIES.murena) / total));
              const aiglesBlock = Math.max(1, count - murenaBlock);

              if (i < murenaBlock) spineTex = pickSlice(bdTextures[6], i, murenaBlock, SERIES.murena, ...TRIM.murena);
              else spineTex = pickSlice(bdTextures[4], i - murenaBlock, aiglesBlock, SERIES.aigles, ...TRIM.aigles);
            }

            if (rowIndex === 0) {
              const total = SERIES.complainte + SERIES.vieux + SERIES.jeremiah;
              const complainteBlock = Math.max(1, Math.round((count * SERIES.complainte) / total));
              const vieuxBlock = Math.max(1, Math.round((count * SERIES.vieux) / total));
              const used = complainteBlock + vieuxBlock;
              const jeremiahBlock = Math.max(1, count - used);

              if (i < complainteBlock)
                spineTex = pickSlice(bdTextures[1], i, complainteBlock, SERIES.complainte, ...TRIM.complainte);
              else if (i < complainteBlock + vieuxBlock)
                spineTex = pickSlice(bdTextures[5], i - complainteBlock, vieuxBlock, SERIES.vieux, ...TRIM.vieux);
              else
                spineTex = pickSlice(
                  bdTextures[2],
                  i - (complainteBlock + vieuxBlock),
                  jeremiahBlock,
                  SERIES.jeremiah,
                  ...TRIM.jeremiah
                );
            }
          }
       

          return (
            <Book
              key={`${rowIndex}-${y}-${i}`}
              x={x}
              y={y + 0.02}
              h={h}
              w={w}
              c={baseColor}
              tilt={tilt}
              variant={globalIndex}
              spineTex={spineTex}
            />
          );
        })}
      </group>
    );
  }

  const [bottomCount, midCount, topCount] = ROW_COUNTS;

  return (
    <group>
      {onPickShelf && (
        <InteractiveItem onPick={onPickShelf}>
          <mesh position={[0, H / 2, frontZ - 0.02]}>
            <boxGeometry args={[W * 0.98, H * 0.98, 0.02]} />
            <meshStandardMaterial transparent opacity={0} />
          </mesh>
        </InteractiveItem>
      )}

      <mesh position={[0, H / 2, backZ]} receiveShadow>
        <boxGeometry args={[W - frameT * 1.2, H - frameT * 1.2, 0.06]} />
        <primitive object={innerBackMat} attach="material" />
      </mesh>

      <mesh position={[-W / 2 + frameT / 2, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameT, H, D]} />
        <primitive object={walnutMat} attach="material" />
      </mesh>
      <mesh position={[W / 2 - frameT / 2, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameT, H, D]} />
        <primitive object={walnutMat} attach="material" />
      </mesh>
      <mesh position={[0, frameT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, frameT, D]} />
        <primitive object={walnutMat} attach="material" />
      </mesh>
      <mesh position={[0, H - frameT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, frameT, D]} />
        <primitive object={walnutMat} attach="material" />
      </mesh>

      {[0.95, 1.55, 2.15].map((yy, idx) => (
        <mesh key={idx} position={[0, yy, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[W - frameT * 1.2, 0.08, D - 0.1]} />
          <primitive object={walnutMat} attach="material" />
        </mesh>
      ))}

      <Row rowIndex={0} y={0.62} count={bottomCount} offset={0} />
      <Row rowIndex={1} y={1.22} count={midCount} offset={bottomCount} />
      <Row rowIndex={2} y={1.82} count={topCount} offset={bottomCount + midCount} />

      <mesh position={[0, H - 0.24, frontZ + 0.03]} castShadow receiveShadow>
        <boxGeometry args={[W * 0.52, 0.16, 0.01]} />
        <meshStandardMaterial color={labelAccent} roughness={0.5} metalness={0.02} />
      </mesh>
      <Text
        position={[0, H - 0.24, frontZ + 0.05]}
        fontSize={0.16}
        color={"#0b0b0b"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor={"#ffffff"}
      >
        {label}
      </Text>
    </group>
  );
}

export default function BookcaseWall({
  isMobile,
  walnutMat,
  shelfZ = -7.35,
  pick,          
  focusForShelf, 
  signText = "PARCOURS & EXPÉRIENCES",
}) {
  const shelves = useMemo(
    () => [
      { x: -6.2, theme: "comics", sectionId: "career", label: "PARCOURS LOGISTIQUE", labelSize: 0.42, arrowSize: 0.95 },
      { x: 0.0, theme: "bd", sectionId: "projects", label: "PROJETS WEB", labelSize: 0.52, arrowSize: 1.1 },
      { x: 6.2, theme: "manga", sectionId: "stack", label: "COMPÉTENCES TECH", labelSize: 0.42, arrowSize: 0.95 },
    ],
    []
  );

  const signPos = useMemo(() => [0, 3.95, shelfZ - 0.43], [shelfZ]);

  return (
    <>
     
      <WallWoodSign
        position={signPos}
        text={signText}
        walnutMat={walnutMat}
        isMobile={isMobile}
      />

      {shelves.map((s) => (
        <group key={s.sectionId} position={[s.x, 0.0, shelfZ]}>
          <BookcaseUnit
            theme={s.theme}
            walnutMat={walnutMat}
            isMobile={isMobile}
            onPickShelf={() => {
              const { pos, look } = focusForShelf(s.x);
              pick(s.sectionId, pos, look);
            }}
            onPickItem={(itemIndex) => {
              const { pos, look } = focusForShelf(s.x);
              pick(s.sectionId, pos, look, itemIndex);
            }}
          />
        </group>
      ))}

      {shelves.map((s) => (
        <group key={`${s.sectionId}-labels`}>
          <FloorLabel
            position={[s.x, 0.102, shelfZ + 1.65]}
            text={s.label}
            fontSize={s.labelSize}
          />
          <FloorArrow
            position={[s.x, 0.102, shelfZ + 1.18]}
            direction="towardsShelf"
            fontSize={s.arrowSize}
          />
        </group>
      ))}
    </>
  );
}
