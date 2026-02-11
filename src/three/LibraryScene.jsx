import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { easing } from "maath";

import FPSController from "./FPSController";
import TouchController from "./TouchController";
import InteractiveItem from "./InteractiveItem";
import AboutPanel from "./AboutPanel";
import DiplomaWall from "./DiplomaWall";
import TravelWall from "./TravelWall";
import MovieWall from "./MovieWall";
import StylizedCeiling from "./StylizedCeiling";

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

function ensureUv2(geo) {
  if (!geo?.attributes?.uv) return;
  if (geo.attributes.uv2) return;
  geo.setAttribute("uv2", new THREE.BufferAttribute(geo.attributes.uv.array, 2));
}

function usePBRMaps(basePath, repeat = [1, 1]) {
  const maps = useTexture({
    map: `${basePath}/diff.webp`,
    aoMap: `${basePath}/ao.webp`,
    normalMap: `${basePath}/normal.webp`,
    roughnessMap: `${basePath}/rough.webp`,
  });

  const { gl } = useThree();

  useEffect(() => {
    const maxAniso = gl?.capabilities?.getMaxAnisotropy
      ? gl.capabilities.getMaxAnisotropy()
      : 8;

    const apply = (tex, isColor) => {
      if (!tex) return;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);

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
  }, [maps, repeat, gl]);

  return maps;
}

function PBRBox({
  args,
  maps,
  roughness = 0.9,
  metalness = 0.0,
  aoIntensity = 0.7,
  normalScale = 1,
  ...props
}) {
  const geoRef = useRef();
  const ns = useMemo(
    () => new THREE.Vector2(normalScale, normalScale),
    [normalScale]
  );

  useEffect(() => {
    if (geoRef.current) ensureUv2(geoRef.current);
  }, []);

  return (
    <mesh {...props}>
      <boxGeometry ref={geoRef} args={args} />
      <meshStandardMaterial
        map={maps?.map}
        aoMap={maps?.aoMap}
        aoMapIntensity={aoIntensity}
        normalMap={maps?.normalMap}
        normalScale={ns}
        roughnessMap={maps?.roughnessMap}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

function PBRPlane({
  args,
  maps,
  roughness = 0.92,
  metalness = 0.0,
  aoIntensity = 0.7,
  normalScale = 1,
  doubleSide = false,
  ...props
}) {
  const geoRef = useRef();
  const ns = useMemo(
    () => new THREE.Vector2(normalScale, normalScale),
    [normalScale]
  );

  useEffect(() => {
    if (geoRef.current) ensureUv2(geoRef.current);
  }, []);

  return (
    <mesh {...props}>
      <planeGeometry ref={geoRef} args={args} />
      <meshStandardMaterial
        map={maps?.map}
        aoMap={maps?.aoMap}
        aoMapIntensity={aoIntensity}
        normalMap={maps?.normalMap}
        normalScale={ns}
        roughnessMap={maps?.roughnessMap}
        roughness={roughness}
        metalness={metalness}
        side={doubleSide ? THREE.DoubleSide : THREE.FrontSide}
      />
    </mesh>
  );
}

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

  const label =
    theme === "comics" ? "COMICS" : theme === "manga" ? "MANGA" : "BD";
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
        t.anisotropy = 12;
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
  }, [mangaTextures, comicsTextures, bdTextures]);

  const sliceTexture = useCallback((baseTex, i, count, uStart = 0, uEnd = 1) => {
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
    t.anisotropy = 12;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;

    return t;
  }, []);

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
        <group
          position={[x + xNudge, y + yNudge, bookZ + zNudge]}
          rotation={[0, 0, tilt]}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, 0.07]} />
            <meshStandardMaterial
              color={
                isManga
                  ? "#eaeaea"
                  : isComics
                  ? "#101010"
                  : isBD
                  ? "#e8e1d8"
                  : c
              }
              roughness={isComics ? 0.9 : isBD ? 0.85 : 0.72}
              metalness={isComics ? 0.04 : 0.02}
            />
          </mesh>

          {hasSpine && (
            <mesh castShadow receiveShadow position={[0, 0, isBD ? 0.043 : 0.041]}>
              <planeGeometry
                args={[w * (isBD ? 0.96 : 0.92), h * (isBD ? 0.96 : 0.92)]}
              />
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

    const pickSlice = (
      baseTex,
      iInBlock,
      displayBlockCount,
      realCount,
      uStart = 0,
      uEnd = 1
    ) => {
      const localIndex = Math.floor((iInBlock * realCount) / displayBlockCount);
      return sliceTexture(baseTex, localIndex, realCount, uStart, uEnd);
    };

    return (
      <group>
        {Array.from({ length: count }).map((_, i) => {
          const globalIndex = offset + i;
          const x = -W / 2 + leftPad + i * step + step * 0.5;

          const h = theme === "manga" ? 0.545 : theme === "comics" ? 0.59 : 0.62;
          const w =
            theme === "manga"
              ? step * 0.9
              : theme === "comics"
              ? step * 0.86
              : step * 0.88;

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

              if (i < preacherBlock)
                spineTex = pickSlice(comicsTextures[2], i, preacherBlock, SERIES.preacher);
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

              if (i < largoBlock)
                spineTex = pickSlice(bdTextures[3], i, largoBlock, SERIES.largo, ...TRIM.largo);
              else
                spineTex = pickSlice(bdTextures[0], i - largoBlock, signeBlock, SERIES.signe, ...TRIM.signe);
            }

            if (rowIndex === 1) {
              const total = SERIES.murena + SERIES.aigles;
              const murenaBlock = Math.max(1, Math.round((count * SERIES.murena) / total));
              const aiglesBlock = Math.max(1, count - murenaBlock);

              if (i < murenaBlock)
                spineTex = pickSlice(bdTextures[6], i, murenaBlock, SERIES.murena, ...TRIM.murena);
              else
                spineTex = pickSlice(bdTextures[4], i - murenaBlock, aiglesBlock, SERIES.aigles, ...TRIM.aigles);
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
          <boxGeometry args={[W - frameT * 1.2, shelfT, D - 0.1]} />
          <primitive object={walnutMat} attach="material" />
        </mesh>
      ))}

      <Row rowIndex={0} y={0.62} count={bottomCount} offset={0} />
      <Row rowIndex={1} y={1.22} count={midCount} offset={bottomCount} />
      <Row rowIndex={2} y={1.82} count={topCount} offset={bottomCount + midCount} />

      <mesh position={[0, H - 0.24, frontZ]}>
        <boxGeometry args={[W * 0.58, 0.22, 0.05]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
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

function ToneMapping({ exposure }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl, exposure]);
  return null;
}

function SceneInner({
  isMobile,
  isPortrait,
  mobileForwardRef,
  mobileBackRef,
  mobileStrafeRef,
  onOpenSection,
  focus,
  setFocus,
  controlsEnabled,
  setIsLocked,
  mapEditMode,
  setMapEditMode,
}) {
  const light = useMemo(
    () => ({
      exposure: 0.28,
      envIntensity: 0.04,
      ambient: 0.04,
      spotIntensity: 0.25,
      spotAngle: 0.48,
      spotPenumbra: 0.92,
      spotDistance: 28,
      dirA: 0.16,
      dirB: 0.10,
      point: 0.03,
      pointDistance: 22,
    }),
    []
  );

  const fpsEnabled = controlsEnabled && !focus?.active && !mapEditMode;
  const touchEnabled = isMobile && !focus?.active && !mapEditMode;

  const ROOM_BOUNDS = useMemo(
    () => ({ minX: -10.75, maxX: 10.85, minZ: -7.55, maxZ: 7.55 }),
    []
  );

  const cameraTarget = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const fovTarget = useRef(65);

  const floorMaps = usePBRMaps("/textures/floor", [5, 4]);
  const stoneMaps = usePBRMaps("/textures/stone", [7, 3.2]);

  const unlockPointer = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {
        // no-op
      }
    }
    setIsLocked?.(false);
  }, [setIsLocked]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (e) => {
      if (e.key.toLowerCase() !== "m") return;
      setMapEditMode((v) => {
        const next = !v;
        if (next) unlockPointer();
        return next;
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setMapEditMode, unlockPointer]);

  useEffect(() => {
    if (!focus?.active) {
      setGlobalFlag("__UI_ACTIVE__", false);
      return;
    }
    unlockPointer();
    setIsLocked?.(false);
    setGlobalFlag("__UI_ACTIVE__", true);
  }, [focus?.active, unlockPointer, setIsLocked]);

  useEffect(() => {
    if (!fpsEnabled) setIsLocked?.(false);
  }, [fpsEnabled, setIsLocked]);

  const walnutMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#3a2a1f"),
        roughness: 0.55,
        metalness: 0.06,
      }),
    []
  );

  const SHELF_Z = -7.35;

  const focusForShelf = useCallback(
    (x) => ({
      pos: [x, 1.55, -4.95],
      look: [x, 1.35, SHELF_Z - 0.25],
    }),
    [SHELF_Z]
  );

  useFrame((state, dt) => {
    const baseFov = 65;
    const desiredFov = isMobile && isPortrait ? fovTarget.current : baseFov;

    easing.damp(state.camera, "fov", desiredFov, 0.22, dt);
    state.camera.updateProjectionMatrix();

    if (!focus?.active) return;

    cameraTarget.current.set(focus.pos[0], focus.pos[1], focus.pos[2]);
    lookTarget.current.set(focus.look[0], focus.look[1], focus.look[2]);

    easing.damp3(state.camera.position, cameraTarget.current, 0.25, dt);

    if (!state.camera.userData._look) state.camera.userData._look = new THREE.Vector3();
    easing.damp3(state.camera.userData._look, lookTarget.current, 0.25, dt);
    state.camera.lookAt(state.camera.userData._look);

    const dist = state.camera.position.distanceTo(cameraTarget.current);
    if (dist < 0.08 && !focus.opened) {
      setFocus((f) => ({ ...f, opened: true }));
      onOpenSection?.(focus.sectionId, focus.itemId);
    }
  });

  const pick = useCallback(
  (sectionId, pos, look, itemId = null) => {
    unlockPointer();
    setMapEditMode(false);

    if (mobileForwardRef?.current !== undefined) mobileForwardRef.current = false;
    if (mobileBackRef?.current !== undefined) mobileBackRef.current = false;
    if (mobileStrafeRef?.current !== undefined) mobileStrafeRef.current = 0;

    let finalPos = pos;
    let finalLook = look;

    if (isMobile && isPortrait && sectionId === "travels") {
      const dx = pos[0] - look[0];
      const dy = pos[1] - look[1];
      const dz = pos[2] - look[2];

      const k = 2.15;
      finalPos = [look[0] + dx * k, look[1] + dy * k + 0.12, look[2] + dz * k];
      finalLook = [look[0], look[1] + 0.02, look[2]];
      fovTarget.current = 96;
    } else if (isMobile && isPortrait && sectionId === "about") {
      const dx = pos[0] - look[0];
      const dy = pos[1] - look[1];
      const dz = pos[2] - look[2];

      const k = 1.55;
      finalPos = [look[0] + dx * k, look[1] + dy * k + 0.1, look[2] + dz * k];
      finalLook = [look[0], look[1] + 0.06, look[2]];
      fovTarget.current = 58;
    } else {
  
      fovTarget.current = 65;
    }

    setFocus({
      active: true,
      opened: false,
      sectionId,
      itemId,
      pos: finalPos,
      look: finalLook,
    });
  },
  [
    unlockPointer,
    setMapEditMode,
    setFocus,
    mobileForwardRef,
    mobileBackRef,
    mobileStrafeRef,
    isMobile,
    isPortrait,
  ]
);


  return (
    <>
      <ToneMapping exposure={light.exposure} />
      <fog attach="fog" args={["#07070a", 10, 28]} />

      <ambientLight intensity={light.ambient} />

      <spotLight
        position={[0, 6.6, -1.5]}
        angle={light.spotAngle}
        penumbra={light.spotPenumbra}
        intensity={light.spotIntensity}
        distance={light.spotDistance}
        castShadow={!isMobile}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <directionalLight position={[7, 9, 7]} intensity={light.dirA} />
      <directionalLight position={[-6, 5.5, 6]} intensity={light.dirB} />

      <pointLight position={[-7, 4.2, 0]} intensity={light.point} distance={light.pointDistance} />
      <pointLight position={[7, 4.2, 0]} intensity={light.point} distance={light.pointDistance} />

      <Environment files="/hdri/studio_small_03_2k.hdr" background={false} intensity={light.envIntensity} />

      {fpsEnabled && (
        <FPSController enabled={true} onLockChange={setIsLocked} bounds={ROOM_BOUNDS} />
      )}

      {touchEnabled && (
        <TouchController
          enabled={true}
          forwardRef={mobileForwardRef}
          backRef={mobileBackRef}
          strafeRef={mobileStrafeRef}
          speed={3.6}
          strafeSpeed={3.6}
          lookSpeed={0.0042}
          bounds={ROOM_BOUNDS}
        />
      )}

   
      <PBRBox
        receiveShadow={!isMobile}
        position={[0, 0, 0]}
        args={[22, 0.2, 18]}
        maps={floorMaps}
        roughness={0.9}
        metalness={0.0}
        aoIntensity={0.85}
        normalScale={0.9}
      />

    
      <PBRPlane
        position={[0, 2.3, -7.85]}
        receiveShadow={!isMobile}
        args={[22, 4.6]}
        maps={stoneMaps}
        roughness={0.95}
        metalness={0.02}
        aoIntensity={0.75}
        normalScale={0.75}
        doubleSide
      />
      <PBRPlane
        position={[0, 2.3, 7.85]}
        rotation={[0, Math.PI, 0]}
        receiveShadow={!isMobile}
        args={[22, 4.6]}
        maps={stoneMaps}
        roughness={0.95}
        metalness={0.02}
        aoIntensity={0.75}
        normalScale={0.75}
        doubleSide
      />

      <MovieWall position={[0, 2.35, 7.78]} />

    
      <PBRPlane
        position={[-10.98, 2.3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow={!isMobile}
        args={[18, 4.6]}
        maps={stoneMaps}
        roughness={0.95}
        metalness={0.02}
        aoIntensity={0.75}
        normalScale={0.75}
        doubleSide
      />
      <PBRPlane
        position={[10.98, 2.3, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow={!isMobile}
        args={[18, 4.6]}
        maps={stoneMaps}
        roughness={0.95}
        metalness={0.02}
        aoIntensity={0.75}
        normalScale={0.75}
        doubleSide
      />

    
      <mesh position={[-10.92, 0.65, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={!isMobile}>
        <boxGeometry args={[18, 1.3, 0.08]} />
        <primitive object={walnutMat} attach="material" />
      </mesh>
      <mesh position={[10.92, 0.65, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={!isMobile}>
        <boxGeometry args={[18, 1.3, 0.08]} />
        <primitive object={walnutMat} attach="material" />
      </mesh>

      <StylizedCeiling y={4.6} width={22} depth={18} beamCount={6} />

    
      <AboutPanel
        enabled={true}
        isMobile={isMobile}
        isPortrait={isPortrait}
        position={[10.92, 2.55, -2.8]}
        rotation={[0, -Math.PI / 2, 0]}
        baseY={2.55}
        onPick={() => pick("about", [7.9, 2.35, -2.8], [10.5, 2.55, -2.8])}
      />

      <TravelWall
        position={[10.92, 2.55, 3.3]}
        rotation={[0, -Math.PI / 2, 0]}
        mapUrl="/textures/world_map.webp"
        activeIndex={focus?.sectionId === "travels" ? focus?.itemId : null}
        onPickWall={() => pick("travels", [7.8, 2.35, 3.3], [10.5, 2.55, 3.3])}
        onPickPin={(itemIndex) =>
          pick("travels", [7.8, 2.35, 3.3], [10.5, 2.55, 3.3], itemIndex)
        }
      />

      <DiplomaWall
        activeIndex={focus?.sectionId === "diplomas" ? focus?.itemId : null}
        onPickDiplomas={(i) => {
          const zList = [3.8, 1.1, -1.6, -4.3];
          const z = zList[i] ?? -0.5;
          pick("diplomas", [-8.3, 2.4, z], [-10.7, 2.6, z], i);
        }}
      />

     
      <group position={[-6.2, 0.0, SHELF_Z]}>
        <BookcaseUnit
          theme="comics"
          walnutMat={walnutMat}
          isMobile={isMobile}
          onPickShelf={() => {
            const { pos, look } = focusForShelf(-6.2);
            pick("career", pos, look);
          }}
          onPickItem={(itemIndex) => {
            const { pos, look } = focusForShelf(-6.2);
            pick("career", pos, look, itemIndex);
          }}
        />
      </group>

      <group position={[0, 0.0, SHELF_Z]}>
        <BookcaseUnit
          theme="bd"
          walnutMat={walnutMat}
          isMobile={isMobile}
          onPickShelf={() => {
            const { pos, look } = focusForShelf(0);
            pick("projects", pos, look);
          }}
          onPickItem={(itemIndex) => {
            const { pos, look } = focusForShelf(0);
            pick("projects", pos, look, itemIndex);
          }}
        />
      </group>

      <group position={[6.2, 0.0, SHELF_Z]}>
        <BookcaseUnit
          theme="manga"
          walnutMat={walnutMat}
          isMobile={isMobile}
          onPickShelf={() => {
            const { pos, look } = focusForShelf(6.2);
            pick("stack", pos, look);
          }}
          onPickItem={(itemIndex) => {
            const { pos, look } = focusForShelf(6.2);
            pick("stack", pos, look, itemIndex);
          }}
        />
      </group>
    </>
  );
}

export default function LibraryScene({
  paused = false,
  isMobile,
  isPortrait = false,
  controlsEnabled,
  setIsLocked,
  onOpenSection,
  focus,
  setFocus,
  mobileForwardRef,
  mobileBackRef,
  mobileStrafeRef,
}) {
  const [mapEditMode, setMapEditMode] = useState(false);

  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      shadows={!isMobile}
      dpr={isMobile ? 1 : [1, 2]}
      camera={{ position: [0, 1.6, 4], fov: 65 }}
      gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <SceneInner
        isMobile={isMobile}
        isPortrait={isPortrait}
        mobileForwardRef={mobileForwardRef}
        mobileBackRef={mobileBackRef}
        mobileStrafeRef={mobileStrafeRef}
        controlsEnabled={controlsEnabled && !paused}
        setIsLocked={setIsLocked}
        onOpenSection={onOpenSection}
        focus={focus}
        setFocus={setFocus}
        mapEditMode={mapEditMode}
        setMapEditMode={setMapEditMode}
      />
    </Canvas>
  );
}
