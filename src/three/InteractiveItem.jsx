export default function InteractiveItem({ children, onPick }) {
  return (
    <group
      onPointerDown={(e) => {
        e.stopPropagation();
        // évite que le navigateur interprète ça comme un "click normal"
        // et évite aussi les handlers parent qui unlock
        if (e.nativeEvent?.preventDefault) e.nativeEvent.preventDefault();
        onPick?.();
      }}
      onClick={(e) => {
        // on neutralise le click classique (qui peut unlock / bubble)
        e.stopPropagation();
      }}
    >
      {children}
    </group>
  );
}

