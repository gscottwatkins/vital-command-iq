export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] bg-vc-card rounded-t-2xl p-5 overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-zinc-600 rounded-full mx-auto mb-4" />
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
