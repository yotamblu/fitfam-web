// iOS (26+) colours the status-bar area of an installed web app from a fixed element pinned to the
// top edge (>= 6px tall, >= 80% wide, within 4px of the top, with a background colour). Without one it
// falls back to flat black. The colour comes from --chrome-tint, which the signed-in app changes with the
// current level's venue (TabShell); the welcome page keeps the default glow colour.
export default function StatusBarTint() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-2 transition-colors duration-700"
      style={{ backgroundColor: "var(--chrome-tint, #3d1f1a)" }}
    />
  );
}
