import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { easing } from "maath";
import FPSController from "./FPSController";
import InteractiveItem from "./InteractiveItem";
import AboutPanel from "./AboutPanel";
import DiplomaWall from "./DiplomaWall";

function SceneInner({
  onOpenSection,
  focus,
  setFocus,
  controlsEnabled,
  setIsLocked,
}) {
  const cameraTarget = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  // Matériau "papier / trame" version légère
  const paperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#d8d2c7"),
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  );

  const inkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1a22"),
        roughness: 0.8,
        metalness: 0.05,
      }),
    []
  );

  // Animation caméra vers un point + lookAt
  useFrame((state, dt) => {
    if (!focus?.active) return;

    cameraTarget.current.set(focus.pos[0], focus.pos[1], focus.pos[2]);
    lookTarget.current.set(focus.look[0], focus.look[1], focus.look[2]);

    easing.damp3(state.camera.position, cameraTarget.current, 0.25, dt);

    if (!state.camera.userData._look)
      state.camera.userData._look = new THREE.Vector3();
    easing.damp3(state.camera.userData._look, lookTarget.current, 0.25, dt);
    state.camera.lookAt(state.camera.userData._look);

    const dist = state.camera.position.distanceTo(cameraTarget.current);
    if (dist < 0.08 && !focus.opened) {
      setFocus((f) => ({ ...f, opened: true }));
      onOpenSection?.(focus.sectionId);
    }
  });

  // ✅ pick corrigé: accepte itemId + délock juste après
  const pick = (sectionId, pos, look, itemId = null) => {
    setFocus({
      active: true,
      opened: false,
      sectionId,
      itemId,
      pos,
      look,
    });

    // évite l'effet "retour observation" au clic
    setTimeout(() => setIsLocked(false), 0);
  };

  return (
    <>
      {/* Lumières */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <pointLight position={[-6, 2, -2]} intensity={0.7} />

      {/* FPS */}
      <FPSController enabled={controlsEnabled} onLockChange={setIsLocked} />

      {/* Sol */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[22, 0.2, 18]} />
        <primitive object={paperMat} attach="material" />
      </mesh>

      {/* Murs */}
      <mesh position={[0, 2.3, -8]}>
        <boxGeometry args={[22, 4.6, 0.3]} />
        <primitive object={inkMat} attach="material" />
      </mesh>
      <mesh position={[-11, 2.3, 0]}>
        <boxGeometry args={[0.3, 4.6, 18]} />
        <primitive object={inkMat} attach="material" />
      </mesh>
      <mesh position={[11, 2.3, 0]}>
        <boxGeometry args={[0.3, 4.6, 18]} />
        <primitive object={inkMat} attach="material" />
      </mesh>

      {/* ✅ Mur “À propos de moi” */}
      <AboutPanel onPick={() => pick("about", [0, 2.2, -6.2], [0, 2.2, -8])} />

      {/* ✅ Mur Diplômes */}
      <DiplomaWall
        activeIndex={focus?.sectionId === "diplomas" ? focus?.itemId : null}
        onPickDiplomas={(i) =>
          pick(
            "diplomas",
            [-8.3, 2.4, -1.5],
            [-10.7, 2.6, -0.2],
            i
          )
        }
      />

      {/* Étagères (3 zones : BD, Comics, Manga) */}
      <group position={[-6.5, 0, -4]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[3.2, 2.4, 0.6]} />
          <primitive object={inkMat} attach="material" />
        </mesh>

        <InteractiveItem
          onPick={() =>
            pick("projects", [-4.8, 1.6, -3.2], [-6.5, 1.3, -4])
          }
        >
          <mesh position={[0.7, 1.1, 0.35]}>
            <boxGeometry args={[0.25, 0.4, 0.06]} />
            <meshStandardMaterial color={"#e9d36b"} roughness={0.75} />
          </mesh>
        </InteractiveItem>
      </group>

      {/* Étagère du milieu */}
      <group position={[0, 0, -4]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[3.2, 2.4, 0.6]} />
          <primitive object={inkMat} attach="material" />
        </mesh>
      </group>

      <group position={[6.5, 0, -4]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[3.2, 2.4, 0.6]} />
          <primitive object={inkMat} attach="material" />
        </mesh>

        <InteractiveItem
          onPick={() => pick("cv", [4.8, 1.3, -3.0], [6.5, 1.2, -4])}
        >
          <mesh position={[-0.6, 0.9, 0.35]}>
            <boxGeometry args={[0.45, 0.28, 0.08]} />
            <meshStandardMaterial color={"#ff7a9a"} roughness={0.7} />
          </mesh>
        </InteractiveItem>

        <InteractiveItem
          onPick={() =>
            pick("contact", [6.8, 1.25, -2.9], [6.5, 1.2, -4])
          }
        >
          <mesh position={[0.8, 0.75, 0.35]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial color={"#7CFF8D"} roughness={0.7} />
          </mesh>
        </InteractiveItem>
      </group>

      <Environment preset="city" />
    </>
  );
}

export default function LibraryScene({
  controlsEnabled,
  setIsLocked,
  onOpenSection,
  focus,
  setFocus,
}) {
  return (
    <Canvas
      shadows={false}
      camera={{ position: [0, 1.6, 4], fov: 65 }}
      gl={{ antialias: true }}
    >
      <SceneInner
        controlsEnabled={controlsEnabled}
        setIsLocked={setIsLocked}
        onOpenSection={onOpenSection}
        focus={focus}
        setFocus={setFocus}
      />
    </Canvas>
  );
}
