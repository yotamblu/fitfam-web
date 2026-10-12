"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { haptic, sfx } from "@/lib/sfx";

type Tab = { href: string; label: string; Icon: ComponentType<{ className?: string }> };

const PAD = 6; // space between the glass edge and the lens, in px

/**
 * The bottom navigation: a floating, frosted capsule with a quiet lens on the current tab, as in Apple's tab bars.
 * Flat on purpose: one translucent dark surface, one soft lens, no gloss. Press the lens and it grows a little; drag it
 * along the bar and the tab under it lights up; let go and it settles on the nearest tab and opens it. A tap on a tab
 * slides the lens there. The surface takes a hint of the zone colour (`--chrome-bottom`) and the active tab uses the
 * zone accent (`--chrome-accent`).
 */
export default function GlassTabBar({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  const router = useRouter();
  // the app is right-to-left: the first tab sits on the right, so the left-to-right geometry below runs reversed
  const visual = [...tabs].reverse();
  const current = Math.max(
    0,
    visual.findIndex((t) => pathname === t.href || pathname.startsWith(`${t.href}/`)),
  );

  const barRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [dragLeft, setDragLeft] = useState<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const gesture = useRef({ active: false, onLens: false, startX: 0, moved: false, last: -1 });
  const suppressClick = useRef(false);

  useEffect(() => {
    const node = barRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const tabWidth = width / visual.length; // the observed width is the space inside the padding, which the tabs share equally
  const restLeft = PAD + current * tabWidth;
  const lensLeft = dragLeft ?? restLeft;
  const lit = dragLeft !== null ? Math.min(visual.length - 1, Math.max(0, Math.round((dragLeft - PAD) / tabWidth))) : current;

  const localX = (event: React.PointerEvent) => event.clientX - (barRef.current?.getBoundingClientRect().left ?? 0) - 1; // minus the 1px border

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const x = localX(event);
    const onLens = x >= restLeft && x <= restLeft + tabWidth;
    gesture.current = { active: true, onLens, startX: x, moved: false, last: current };
    if (onLens) {
      setPressed(true);
      try {
        barRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // some browsers refuse capture for a synthetic or already-ended pointer; dragging still works without it
      }
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const g = gesture.current;
    if (!g.active || !g.onLens) return;
    const x = localX(event);
    if (!g.moved && Math.abs(x - g.startX) < 4) return;
    g.moved = true;
    const left = Math.min(PAD + width - tabWidth, Math.max(PAD, x - tabWidth / 2));
    setDragLeft(left);
    const over = Math.min(visual.length - 1, Math.max(0, Math.round((left - PAD) / tabWidth)));
    if (over !== g.last) {
      g.last = over;
      haptic(8);
      sfx.tap();
    }
  };

  const finish = (event: React.PointerEvent, cancelled = false) => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;
    setPressed(false);
    try {
      if (g.onLens && barRef.current?.hasPointerCapture(event.pointerId)) barRef.current.releasePointerCapture(event.pointerId);
    } catch {
      // nothing to release
    }
    if (g.moved && !cancelled) {
      const target = visual[lit];
      suppressClick.current = true; // the click that follows a drag must not also fire a link
      window.setTimeout(() => (suppressClick.current = false), 0);
      setDragLeft(null);
      if (target && target.href !== visual[current].href) router.push(target.href);
    } else {
      setDragLeft(null);
    }
  };

  const dragging = dragLeft !== null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] lg:hidden">
      <nav
        ref={barRef}
        aria-label="ניווט ראשי"
        dir="ltr"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finish(e)}
        onPointerCancel={(e) => finish(e, true)}
        className="pointer-events-auto relative mx-auto flex h-[60px] w-full max-w-xs touch-pan-y select-none items-stretch rounded-full p-1.5"
        style={{
          backgroundColor: "color-mix(in srgb, var(--chrome-bottom) 30%, rgba(22,22,25,0.78))",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.32)",
          transition: "background-color 0.7s",
        }}
      >
        {/* the lens: one flat, soft pill under the current tab; it grows a little while pressed */}
        {width > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1.5 bottom-1.5 left-0"
            style={{
              width: tabWidth,
              transform: `translateX(${lensLeft}px)`,
              transition: dragging ? "none" : "transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            <span
              className="block size-full rounded-full"
              style={{
                transform: pressed ? "scale(1.07)" : "scale(1)",
                transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s",
                backgroundColor: pressed ? "rgba(255,255,255,0.17)" : "rgba(255,255,255,0.11)",
              }}
            />
          </span>
        )}

        {visual.map(({ href, label, Icon }, i) => {
          const active = i === lit;
          return (
            <Link
              key={href}
              href={href}
              aria-current={i === current ? "page" : undefined}
              onClick={(event) => {
                if (suppressClick.current) {
                  event.preventDefault();
                  return;
                }
                if (i !== current) sfx.tap();
              }}
              draggable={false}
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-[3px] rounded-full text-[10.5px] font-semibold leading-none"
              style={{ color: active ? "var(--chrome-accent)" : "rgba(255,255,255,0.6)", transition: "color 0.2s" }}
            >
              <Icon className="size-[22px]" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
