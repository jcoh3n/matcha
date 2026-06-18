// Lightweight, on-brand loading spinner (Tailwind only).
const Loader = () => {
  return (
    <div
      className="flex items-center justify-center min-h-[40vh] w-full"
      role="status"
      aria-label="Chargement"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  );
};

export default Loader;
