export default function InteractiveItem({ children, onPick, cursor = "pointer" }) {
  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = cursor;
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onPick?.();
      }}
    >
      {children}
    </group>
  );
}
