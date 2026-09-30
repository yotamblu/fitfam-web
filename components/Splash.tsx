import Image from "next/image";

// Launch splash: big logo on a flat canvas, then fades out to reveal the landing page.
// Pure CSS + a tiny inline script (no hydration needed, so it can never get stuck on screen).
// The inline script flags <html data-splash="on"> so page animations are held (globals.css) and
// releases them just before the splash finishes fading. Flat canvas at the top edge keeps the
// top-edge rule (see CLAUDE.md) - there is no decor to seam against.
const RELEASE_MS = 1700;

export default function Splash() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute("data-splash","on");setTimeout(function(){document.documentElement.removeAttribute("data-splash")},${RELEASE_MS});`,
        }}
      />
      <div
        id="splash"
        aria-hidden="true"
        className="animate-splash-out fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-canvas"
      >
        <div className="animate-splash-glow absolute size-[420px] rounded-full bg-ember/30 blur-[100px]" />
        <Image
          src="/logo-transparent.png"
          alt=""
          width={640}
          height={573}
          priority
          className="animate-splash-logo relative w-[68vw] max-w-[320px] h-auto"
        />
        <div className="absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] mx-auto h-0.5 w-32 overflow-hidden rounded-full bg-border">
          <div className="animate-splash-bar h-full origin-right rounded-full bg-ember" />
        </div>
      </div>
    </>
  );
}
