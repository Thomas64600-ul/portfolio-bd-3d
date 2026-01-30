import { useMemo } from "react";
import { RepeatWrapping, TextureLoader, SRGBColorSpace } from "three";
import { useLoader } from "@react-three/fiber";

export default function WoodFloor({
  size = [22, 18],
  y = 0,
  textureUrl = "/textures/wood_floor.jpg",
}) {
  const map = useLoader(TextureLoader, textureUrl);

  useMemo(() => {
    map.wrapS = map.wrapT = RepeatWrapping;
    map.repeat.set(6, 6); // densité des lames (augmente si tu veux plus fin)
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 8;
  }, [map]);

  return (
    <mesh receiveShadow position={[0, y, 0]}>
      <boxGeometry args={[size[0], 0.18, size[1]]} />
      <meshStandardMaterial map={map} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}
