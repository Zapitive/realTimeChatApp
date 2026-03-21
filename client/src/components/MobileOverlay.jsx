export default function MobileOverlay({ isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
      onClick={onClose}
    ></div>
  );
}