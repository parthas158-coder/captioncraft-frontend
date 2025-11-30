export default function Loader() {
  return (
    <div className="glass-card border-gradient p-6 rounded-2xl animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-white/20 rounded w-3/4"></div>
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
        <div className="h-4 bg-white/20 rounded w-full"></div>
        <div className="h-4 bg-white/20 rounded w-2/3"></div>
      </div>
    </div>
  );
}
