import { useMemo } from "react";
import AboutPanel from "./AboutPanel";
import TravelWall from "./TravelWall";
import { WallWoodSign, FloorLabel, FloorArrow } from "./SceneLabels";

export default function AboutTravelSection({
  isMobile,
  isPortrait,
  walnutMat,
  focus,
  pick,
  aboutPos = [10.92, 2.00, -4.5],
  aboutRot = [0, -Math.PI / 2, 0],
  aboutBaseY = 1.90,
  travelPos = [10.92, 1.90, 3.9],
  travelRot = [0, -Math.PI / 2, 0],
  mapUrl = "/textures/world_map.webp",
  signText = "À PROPOS & VOYAGES",
}) {
  
  const zMid = useMemo(
    () => (aboutPos[2] + travelPos[2]) / 2,
    [aboutPos, travelPos]
  );

  const signPos = useMemo(() => [aboutPos[0] - 0.02, 3.88, zMid], [aboutPos, zMid]);
  const signRot = useMemo(() => [0, -Math.PI / 2, 0], []);

  const floorY = 0.105;
  const floorX = aboutPos[0] - 0.55;
  const floorRot = useMemo(() => [0, -Math.PI / 2, 0], []);

  const aboutFloorZ = aboutPos[2];
  const travelFloorZ = travelPos[2];

  const LOOK_Y = 2.25;

  const MAP_SCALE = 0.78;  
  const MAP_FRONT_X = 0.14; 

  return (
    <>
    
      <WallWoodSign
        position={signPos}
        rotation={signRot}
        text={signText}
        walnutMat={walnutMat}
        isMobile={isMobile}
      />

      <AboutPanel
        enabled={true}
        isMobile={isMobile}
        isPortrait={isPortrait}
        position={aboutPos}
        rotation={aboutRot}
        baseY={aboutBaseY}
        onPick={() =>
          pick("about", [7.9, aboutPos[1], aboutPos[2]], [10.5, LOOK_Y, aboutPos[2]])
        }
      />

      <group
        position={[travelPos[0] - MAP_FRONT_X, travelPos[1], travelPos[2]]}
        rotation={travelRot}
        scale={[MAP_SCALE, MAP_SCALE, 1]}
      >
        <TravelWall
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          mapUrl={mapUrl}
          activeIndex={focus?.sectionId === "travels" ? focus?.itemId : null}
          onPickWall={() =>
            pick(
              "travels",
              [7.8, travelPos[1], travelPos[2]],
              [10.5, LOOK_Y, travelPos[2]]
            )
          }
          onPickPin={(itemIndex) =>
            pick(
              "travels",
              [7.8, travelPos[1], travelPos[2]],
              [10.5, LOOK_Y, travelPos[2]],
              itemIndex
            )
          }
        />
      </group>

      <group position={[floorX, 0, aboutFloorZ]} rotation={floorRot}>
        <FloorLabel position={[0, floorY, 1.02]} text="pour me connaître" fontSize={0.34} />
        <FloorLabel position={[0, floorY, 0.70]} text="Cliquez sur le tableau" fontSize={0.34} />
        <FloorArrow position={[0, floorY, 0.26]} direction="towardsShelf" fontSize={0.95} />
      </group>

      <group position={[floorX, 0, travelFloorZ]} rotation={floorRot}>
        <FloorLabel position={[0, floorY, 1.02]} text="et sur les pins" fontSize={0.34} />
        <FloorLabel position={[0, floorY, 0.70]} text="Cliquez sur la carte" fontSize={0.34} />
        <FloorArrow position={[0, floorY, 0.26]} direction="towardsShelf" fontSize={0.95} />
      </group>
    </>
  );
}
