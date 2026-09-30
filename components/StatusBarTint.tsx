// iOS (26+) colours the status-bar area of an installed web app from a fixed element pinned to the
// top edge (>= 6px tall, >= 80% wide, within 4px of the top, with a background colour). Without one it
// falls back to flat black. This strip matches the glow at the top of the welcome page so there is no visible bar.
export default function StatusBarTint() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto h-2 max-w-md bg-status-tint"
    />
  );
}
