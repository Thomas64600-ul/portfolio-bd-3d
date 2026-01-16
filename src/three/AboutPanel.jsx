import InteractiveItem from "./InteractiveItem";

export default function AboutPanel({ onPick }) {
  console.log("✅ AboutPanel rendu"); // <- tu dois le voir dans la console navigateur

  return (
    <InteractiveItem onPick={onPick}>
      {/* Debug: très proche + très grand + rouge */}
      <group position={[0, 2.3, -6]} rotation={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[6, 4, 0.2]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
    </InteractiveItem>
  );
}
