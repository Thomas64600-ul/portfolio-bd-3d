import { useMemo } from "react";
import * as THREE from "three";

import DiplomaWall from "./DiplomaWall";
import { WallWoodSign, FloorLabel, FloorArrow } from "./SceneLabels";

export default function DiplomaSection({
  isMobile,
  walnutMat,
  activeIndex,
  onPickDiplomas,

  wallX = -10.75,
  wallY = 2.85,
  wallZMid = -0.25,

  signText = "DIPLÔMES & CERTIFICATIONS",
}) {
 
  const signPos = useMemo(() => [wallX + 0.06, 3.95, wallZMid], [wallX, wallZMid]);
  const signRot = useMemo(() => [0, Math.PI / 2, 0], []);


  const floorY = 0.105;

  const floorX = wallX + 0.50; 
  const floorZ = wallZMid;     

  const floorGroupRot = useMemo(() => [0, Math.PI / 2, 0], []);

  return (
    <>
      <WallWoodSign
        position={signPos}
        rotation={signRot}
        text={signText}
        walnutMat={walnutMat}
        isMobile={isMobile}
      />

      <DiplomaWall onPickDiplomas={onPickDiplomas} activeIndex={activeIndex} />

      <group position={[floorX, 0, floorZ]} rotation={floorGroupRot}>
      
        <FloorLabel
          position={[0, floorY, 1.05]}
          text="pour l’agrandir"
          fontSize={0.34}
        />
        <FloorLabel
          position={[0, floorY, 0.72]}
          text="Cliquez sur le cadre"
          fontSize={0.34}
        />

        <FloorArrow
          position={[0, floorY, 0.30]}
          direction="towardsShelf"
          fontSize={0.95}
        />
      </group>
    </>
  );
}
