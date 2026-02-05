import { useMemo, useEffect, useRef, useCallback } from "react";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SECTIONS } from "../data/sections";
import InteractiveItem from "./InteractiveItem";

const DEBUG_PINS = false;

const MAP_W = 6.8;
const MAP_H = 3.6;

const PIN_SIZE = 0.04;
const FLIP_V = true;

const PINS = [
  { label: "Inde", itemIndex: 0, uv: [0.6436, 0.5154] },
  { label: "Vietnam", itemIndex: 1, uv: [0.725, 0.535] },
  { label: "Cambodge", itemIndex: 2, uv: [0.715, 0.545] },
  { label: "Nouvelle-Calédonie", itemIndex: 3, uv: [0.8905, 0.6894] },
  { label: "Sud du Portugal", itemIndex: 4, uv: [0.429, 0.4045] },
  { label: "Tenerife", itemIndex: 5, uv: [0.4029, 0.4626] },
  { label: "Minorque", itemIndex: 6, uv: [0.4638, 0.3936] },
  { label: "Pays de Galles", itemIndex: 7, uv: [0.4436, 0.3327] },
];

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

function setGlobalNumber(key, value) {
  if (typeof window === "undefined") return;
  window[key] = Number(value) || 0;
}

function isBlockedForMap() {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const until = Number(window.__MAP_INTERACT_UNTIL__ || 0);
  if (now < until) return true;

  return !!window.__TOUCH_LOOKING__ || !!window.__JOYSTICK_ACTIVE__;
}

export default function TravelWall({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  mapUrl = "/textures/world_map.jpg",
  activeIndex = null,
  onPickPin,
  onPickWall,
}) {
  const mapRef = useRef(null);

  
  const raycasterRef = useRef(new THREE.Raycaster());

 
  const centerRayRef = useRef(new THREE.Raycaster());
  const camDirRef = useRef(new THREE.Vector3());

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

  const mapMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: mapTex,
        roughness: 0.92,
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

  
  const isInMapZoneRef = useRef(false);

  const computeInMapZone = useCallback(() => {
    const mesh = mapRef.current;
    if (!mesh) return false;

    
    camera.getWorldDirection(camDirRef.current);
    centerRayRef.current.set(camera.position, camDirRef.current);

    const hits = centerRayRef.current.intersectObject(mesh, false);
    if (!hits.length) return false;

    const dist = hits[0].distance;

    
    const maxDist = 7.2;
    return dist <= maxDist;
  }, [camera]);

  useFrame(() => {
    const ok = computeInMapZone();

    if (ok !== isInMapZoneRef.current) {
      isInMapZoneRef.current = ok;

      setGlobalFlag("__MAP_MODE__", ok);

      if (ok) setGlobalNumber("__MAP_INTERACT_UNTIL__", Date.now() + 220);
      else setGlobalNumber("__MAP_INTERACT_UNTIL__", Date.now() + 80);
    }
  });

  const handlePickDebugUV = useCallback(
    (e) => {
      if (!DEBUG_PINS) return;

      const mesh = mapRef.current;
      if (!mesh) return;

      const native = e?.nativeEvent;
      if (!native) return;

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

      console.log("🧭 UV :", [u, v]);
    },
    [camera, gl]
  );

  const pickWall = useCallback(
    (e) => {
      if (DEBUG_PINS) return;

      e?.stopPropagation?.();

      if (isBlockedForMap()) return;
      if (!isInMapZoneRef.current) return;

      setGlobalNumber("__MAP_INTERACT_UNTIL__", Date.now() + 260);

      onPickWall?.();
    },
    [onPickWall]
  );

  const pickPin = useCallback(
    (itemIndex, e) => {
      e?.stopPropagation?.();

      if (isBlockedForMap()) return;
      if (!isInMapZoneRef.current) return;

      setGlobalNumber("__MAP_INTERACT_UNTIL__", Date.now() + 300);

      onPickPin?.(itemIndex);
    },
    [onPickPin]
  );

  return (
    <group position={position} rotation={rotation}>
      <InteractiveItem
        disabled={false}
        onPick={(e) => {
          if (DEBUG_PINS) handlePickDebugUV(e);
          else pickWall(e);
        }}
      >
        <mesh ref={mapRef} position={[0, 0, MAP_Z]} material={mapMat}>
          <planeGeometry args={[MAP_W, MAP_H]} />
        </mesh>
      </InteractiveItem>

      {!DEBUG_PINS &&
        PINS.map((p) => {
          const isActive = activeIndex === p.itemIndex;
          const [x, y] = uvToXY(p.uv[0], p.uv[1]);

          return (
            <group key={`${p.label}-${p.itemIndex}`} position={[x, y, PIN_Z]}>
              <InteractiveItem onPick={(e) => pickPin(p.itemIndex, e)}>
                <group>
                  <mesh>
                    <sphereGeometry args={[PIN_SIZE, 20, 20]} />
                    <meshStandardMaterial
                      color={isActive ? "#ff6b8a" : "#ff7a9a"}
                      roughness={0.35}
                      metalness={0.1}
                    />
                  </mesh>

               
                  <mesh>
                    <sphereGeometry args={[PIN_SIZE * 2.6, 12, 12]} />
                    <meshBasicMaterial
                      transparent
                      opacity={0.001}
                      depthWrite={false}
                      depthTest={false}
                    />
                  </mesh>
                </group>
              </InteractiveItem>
            </group>
          );
        })}
    </group>
  );
}



