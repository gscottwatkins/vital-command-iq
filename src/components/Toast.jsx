export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-vc-cyan text-vc-bg px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-vc-cyan/40 animate-fade-up">
      {message}
    </div>
  );
}
