import { useMemo, useEffect, useRef, useCallback } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SECTIONS } from "../data/sections";

const DEBUG_PINS = false;

const MAP_W = 6.8;
const MAP_H = 3.6;

const PIN_SIZE = 0.04;
const FLIP_V = true;

const PINS = [
  { label: "Inde", itemIndex: 0, uv: [0.6436, 0.5154] },
  { label: "Vietnam", itemIndex: 1, uv: [0.7250, 0.535] },
  { label: "Cambodge", itemIndex: 2, uv: [0.715, 0.545] },
  { label: "Nouvelle-Calédonie", itemIndex: 3, uv: [0.8905, 0.6894] },
  { label: "Sud du Portugal", itemIndex: 4, uv: [0.429, 0.4045] },
  { label: "Tenerife", itemIndex: 5, uv: [0.4029, 0.4626] },
  { label: "Minorque", itemIndex: 6, uv: [0.4638, 0.3936] },
  { label: "Pays de Galles", itemIndex: 7, uv: [0.4436, 0.3327] },
];

export default function TravelWall({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  mapUrl = "/textures/world_map.jpg",
  activeIndex = null,
  onPickPin,
  onPickWall,
}) {
  const mapRef = useRef();
  const raycasterRef = useRef(new THREE.Raycaster());

  const mapTex = useLoader(THREE.TextureLoader, mapUrl);
  const { camera, gl } = useThree();

  const items = SECTIONS?.travels?.items || [];

  useEffect(() => {
    if (!mapTex) return;

    
    mapTex.colorSpace = THREE.SRGBColorSpace;

    mapTex.anisotropy = 8;
    mapTex.wrapS = THREE.ClampToEdgeWrapping;
    mapTex.wrapT = THREE.ClampToEdgeWrapping;
    mapTex.needsUpdate = true;
  }, [mapTex]);

  useEffect(() => {
    if (!DEBUG_PINS) return;
    if (document.pointerLockElement) document.exitPointerLock();
  }, []);

  const mapMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: mapTex,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [mapTex]
  );

  const MAP_Z = 0;
  const PIN_Z = 0.15;

  const uvToXY = useCallback((u, v) => {
    const vv = FLIP_V ? 1 - v : v;
    const x = (u - 0.5) * MAP_W;
    const y = (vv - 0.5) * MAP_H;
    return [x, y];
  }, []);

  const handlePickDebugUV = useCallback(
    (e) => {
      if (!DEBUG_PINS) return;
      e.stopPropagation();

      if (document.pointerLockElement) {
        document.exitPointerLock();
        console.warn("🔒 PointerLock actif -> libère la souris puis reclique.");
        return;
      }

      const mesh = mapRef.current;
      if (!mesh) return;

      const native = e.nativeEvent;
      const rect = gl.domElement.getBoundingClientRect();

      const ndc = new THREE.Vector2(
        ((native.clientX - rect.left) / rect.width) * 2 - 1,
        -(((native.clientY - rect.top) / rect.height) * 2 - 1)
      );

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(ndc, camera);

      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length) return;

      const hit = hits[0];
      if (!hit.uv) return;

      const u = Number(hit.uv.x.toFixed(4));
      const vRaw = Number(hit.uv.y.toFixed(4));
      const v = FLIP_V ? Number((1 - vRaw).toFixed(4)) : vRaw;

      console.log("🧭 UV STABLE A COLLER :", [u, v]);
    },
    [camera, gl]
  );

  const handlePickWall = useCallback(
    (e) => {
      if (DEBUG_PINS) return;
      e.stopPropagation();
      onPickWall?.();
    },
    [onPickWall]
  );

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={mapRef}
        position={[0, 0, MAP_Z]}
        material={mapMat}
        onPointerDown={DEBUG_PINS ? handlePickDebugUV : handlePickWall}
      >
        <planeGeometry args={[MAP_W, MAP_H]} />
      </mesh>

      {!DEBUG_PINS &&
        PINS.map((p) => {
          const isActive = activeIndex === p.itemIndex;
          const item = items?.[p.itemIndex];
          const title = item?.title || item?.name || p.label;

          const [x, y] = uvToXY(p.uv[0], p.uv[1]);

          const pickPin = (e) => {
            e.stopPropagation();
            onPickPin?.(p.itemIndex);
          };

          return (
            <mesh
              key={`${p.label}-${p.itemIndex}`}
              position={[x, y, PIN_Z]}
              onPointerDown={pickPin}
              userData={{
                type: "pin",
                label: p.label,
                itemIndex: p.itemIndex,
                title,
                pick: () => onPickPin?.(p.itemIndex),
              }}
            >
              <sphereGeometry args={[PIN_SIZE, 20, 20]} />
              <meshStandardMaterial
                color={isActive ? "#ff6b8a" : "#ff7a9a"}
                roughness={0.35}
                metalness={0.1}
              />
            </mesh>
          );
        })}
    </group>
  );
}

