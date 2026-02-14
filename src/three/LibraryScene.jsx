import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { easing } from "maath";

import FPSController from "./FPSController";
import TouchController from "./TouchController";
import DiplomaSection from "./DiplomaSection";
import MovieWall from "./MovieWall";
import StylizedCeiling from "./StylizedCeiling";

import AboutTravelSection from "./AboutTravelSection";
import BookcaseWall from "./BookcaseWall";

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

function ensureUv2(geo) {
  if (!geo?.attributes?.uv) return;
  if (geo.attributes.uv2) return;
  geo.setAttribute("uv2", new THREE.BufferAttribute(geo.attributes.uv.array, 2));
}

function usePBRMaps(basePath, repeat = [1, 1], opts = {}) {
  const { isMobile = false, disableNormalOnMobile = true } = opts;

  const maps = useTexture(
    isMobile
      ? {
          map: `${basePath}/diff.webp`,
          roughnessMap: `${basePath}/rough.webp`,
        }
      : {
          map: `${basePath}/diff.webp`,
          aoMap: `${basePath}/ao.webp`,
          normalMap: `${basePath}/normal.webp`,
          roughnessMap: `${basePath}/rough.webp`,
        }
  );

  const { gl } = useThree();

  useEffect(() => {
    const maxAniso = gl?.capabilities?.getMaxAnisotropy
      ? gl.capabilities.getMaxAnisotropy()
      : 8;

    const aniso = isMobile ? 1 : Math.min(16, maxAniso);

    const apply = (tex, isColor) => {
      if (!tex) return;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);

      tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;

      tex.anisotropy = aniso;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
    };

    apply(maps.map, true);
    apply(maps.aoMap, false);
    apply(maps.normalMap, false);
    apply(maps.roughnessMap, false);
  }, [maps, repeat, gl, isMobile]);

  const effective = useMemo(() => {
  
    if (!isMobile || !disableNormalOnMobile) return maps;
    
    return { ...maps, normalMap: null, aoMap: null };
  }, [maps, isMobile, disableNormalOnMobile]);

  return effective;
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
  const ns = useMemo(() => new THREE.Vector2(normalScale, normalScale), [normalScale]);

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
  const ns = useMemo(() => new THREE.Vector2(normalScale, normalScale), [normalScale]);

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

  const floorMaps = usePBRMaps("/textures/floor", [5, 4], {
    isMobile,
    disableNormalOnMobile: true,
  });
  const stoneMaps = usePBRMaps("/textures/stone", [7, 3.2], {
    isMobile,
    disableNormalOnMobile: true,
  });

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

  const hdriFile = "/hdri/studio_small_03_1k.hdr";

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

      <Environment files={hdriFile} background={false} intensity={light.envIntensity} />

      {fpsEnabled && <FPSController enabled={true} onLockChange={setIsLocked} bounds={ROOM_BOUNDS} />}

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
          dragThresholdPx={26}
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
        normalScale={isMobile ? 0 : 0.9}
      />

      <PBRPlane
        position={[0, 2.3, -7.85]}
        receiveShadow={!isMobile}
        args={[22, 4.6]}
        maps={stoneMaps}
        roughness={0.95}
        metalness={0.02}
        aoIntensity={0.75}
        normalScale={isMobile ? 0 : 0.75}
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
        normalScale={isMobile ? 0 : 0.75}
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
        normalScale={isMobile ? 0 : 0.75}
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
        normalScale={isMobile ? 0 : 0.75}
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

      <AboutTravelSection
        isMobile={isMobile}
        isPortrait={isPortrait}
        walnutMat={walnutMat}
        focus={focus}
        pick={pick}
      />

      <DiplomaSection
        isMobile={isMobile}
        walnutMat={walnutMat}
        activeIndex={focus?.sectionId === "diplomas" ? focus?.itemId : null}
        onPickDiplomas={(i) => {
          const zList = [3.8, 1.1, -1.6, -4.3];
          const z = zList[i] ?? -0.5;
          pick("diplomas", [-8.3, 2.4, z], [-10.7, 2.6, z], i);
        }}
      />

      <BookcaseWall
        isMobile={isMobile}
        walnutMat={walnutMat}
        shelfZ={SHELF_Z}
        pick={pick}
        focusForShelf={focusForShelf}
      />
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

  const enableShadows = !isMobile;

  return (
    <Canvas
     
      frameloop={paused ? "never" : "always"}
      shadows={enableShadows}
      
      dpr={isMobile ? 1 : [1, 1.5]}
      camera={{ position: [0, 1.6, 4], fov: 65 }}
      gl={{
        antialias: !isMobile,
        powerPreference: isMobile ? "low-power" : "high-performance",
        alpha: false,
        stencil: false,
        preserveDrawingBuffer: false,
      }}
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
