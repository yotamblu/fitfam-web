import Image from "next/image";

// Launch splash: big logo on a flat canvas, then fades out to reveal the page.
// Two modes, chosen by the first path of the document: the welcome page uses a timed splash (CSS only); the signed-in
// screens (/home, /roadmap, /profile, /workout) HOLD the splash until the app calls releaseSplash() (lib/splash.ts), so
// there is no loading screen between the splash and the screen, however slow the network is. The splash always stays
// at least RELEASE_MS on screen.
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
          __html: `(function(){var h=document.documentElement,t0=Date.now();h.setAttribute("data-splash","on");if(!/^\\/(home|roadmap|profile|workout)(\\/|$)/.test(location.pathname)){setTimeout(function(){h.removeAttribute("data-splash")},${RELEASE_MS});return}h.setAttribute("data-splash-hold","on");window.__ffRelease=function(){if(window.__ffReleased)return;window.__ffReleased=1;setTimeout(function(){h.removeAttribute("data-splash");h.setAttribute("data-splash-leave","on");setTimeout(function(){h.setAttribute("data-splash-gone","on")},500)},Math.max(0,${RELEASE_MS}-(Date.now()-t0)))}})();`,
        }}
      />
      <div
        id="splash"
        aria-hidden="true"
        className="animate-splash-out fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-canvas"
      >
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
