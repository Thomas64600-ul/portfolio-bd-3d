import { useMemo } from "react";
import { Text, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

export function WallWoodSign({
  position = [0, 3.55, -7.78],
  rotation = [0, 0, 0.00],
  text = "P A R C O U R S  &  E X P E R I E N C E S",
  walnutMat,
  isMobile = false,
}) {
  const W = 10.2;
  const H = 0.72;
  const T = 0.1;

  const metalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#3a3a3a"),
        roughness: 0.28,
        metalness: 0.95,
      }),
    []
  );

  const insetMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1c1a18"),
        roughness: 0.92,
        metalness: 0.02,
      }),
    []
  );

  const woodMat = useMemo(() => {
    if (walnutMat) return walnutMat;
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2a1c14"),
      roughness: 0.45,
      metalness: 0.05,
    });
  }, [walnutMat]);

  return (
    <group position={position} rotation={rotation}>
     
      <mesh castShadow={!isMobile} receiveShadow={!isMobile}>
        <boxGeometry args={[W * 1.01, H * 1.08, T * 1.1]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

      <mesh
        position={[0, 0, T * 0.02]}
        castShadow={!isMobile}
        receiveShadow={!isMobile}
      >
        <boxGeometry args={[W, H, T]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

      <mesh
        position={[0, 0, T * 0.6]}
        castShadow={!isMobile}
        receiveShadow={!isMobile}
      >
        <boxGeometry args={[W * 0.975, H * 0.82, 0.012]} />
        <primitive object={insetMat} attach="material" />
      </mesh>

      {[
        [-W * 0.47, H * 0.38],
        [W * 0.47, H * 0.38],
        [-W * 0.47, -H * 0.38],
        [W * 0.47, -H * 0.38],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, T * 0.64]}>
          <mesh castShadow={!isMobile} receiveShadow={!isMobile}>
            <cylinderGeometry args={[0.055, 0.055, 0.02, 18]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <boxGeometry args={[0.07, 0.012, 0.008]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
        </group>
      ))}

      <Center position={[0, 0, T * 0.72]}>
        <mesh renderOrder={10}>
          <Text3D
            font="/fonts/Inter_Regular.json"
            size={0.34}
            height={0.012}
            curveSegments={12}
            bevelEnabled={false}
          >
            {text}
            <meshStandardMaterial
              color="#e9e6df"
              roughness={0.9}
              metalness={0.02}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
            />
          </Text3D>
        </mesh>
      </Center>
    </group>
  );
}

export function FloorLabel({
  position = [0, 0.102, 0],
  rotation = [-Math.PI / 2, 0, 0],
  text = "LABEL",
  fontSize = 0.44,
  color = "#F5F5F5",      
  opacity = 1,
  letterSpacing = 0.06,
}) {
  return (
    <group position={position} rotation={rotation}>
      <Text
        position={[0, 0, 0.0015]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={opacity}
        letterSpacing={letterSpacing}
        renderOrder={50}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
        outlineWidth={0.035}      
        outlineColor="#0B0B0B"    
        outlineOpacity={0.85}
      >
        {text}
      </Text>

      <Text
        position={[0.008, -0.008, 0.0010]}
        fontSize={fontSize}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.18}
        letterSpacing={letterSpacing}
        renderOrder={49}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      >
        {text}
      </Text>
    </group>
  );
}


export function FloorArrow({
  position = [0, 0.102, 0],
  rotation = [-Math.PI / 2, 0, 0],
  direction = "towardsShelf",
  fontSize = 0.62,
  color = "#F5F5F5",
  opacity = 1,
}) {
  const rotY = direction === "towardsShelf" ? Math.PI : 0;

  return (
    <group position={position} rotation={[rotation[0], rotation[1] + rotY, rotation[2]]}>
      <Text
        position={[0, 0, 0.0015]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={opacity}
        renderOrder={50}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
        outlineWidth={0.04}
        outlineColor="#0B0B0B"
        outlineOpacity={0.85}
      >
        {"▲"}
      </Text>

      <Text
        position={[0.01, -0.01, 0.0010]}
        fontSize={fontSize}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.16}
        renderOrder={49}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      >
        {"▲"}
      </Text>
    </group>
  );
}
