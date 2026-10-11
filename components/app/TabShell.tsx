"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ratio, rankTitle } from "@/lib/gamify";
import { ChromeContext, DEFAULT_TINT, type Tint } from "./Chrome";
import { BoltIcon, FlameIcon, HomeIcon, LogoutIcon, RoadIcon, UserIcon } from "./icons";
import { useSession } from "./Session";
import RoadmapHud from "./RoadmapHud";
import { ProgressRing } from "./ui";

const TABS = [
  { href: "/home", label: "בית", Icon: HomeIcon },
  { href: "/roadmap", label: "מסלול", Icon: RoadIcon },
  { href: "/profile", label: "פרופיל", Icon: UserIcon },
];

function Avatar({ name, url, size }: { name: string; url: string | null; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-surface-raised font-heading font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

/**
 * The frame around the main screens. Phones and tablets: a header and a bottom tab bar. Desktop (lg and up): a fixed
 * side bar with the logo, the tabs, the plan switcher and the player card, and the content gets the full width.
 *
 * The bars wear the classic orange everywhere except on the roadmap, where they are tinted by the zone (venue and
 * level) under each bar as you scroll (the roadmap reports it through useChromeOverride). The same colour is given to
 * the iOS status strip (--chrome-tint) and the browser theme colour.
 */
export default function TabShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, stats, logout } = useSession();
  const onRoadmap = pathname.startsWith("/roadmap");
  const [override, setOverride] = useState<Tint | null>(null);
  const name = user.displayName ?? user.email;

  const tint = override ?? DEFAULT_TINT;
  const chromeValue = useMemo(() => ({ setOverride }), []);

  // the status strip (outside this component) and the browser theme colour follow the top colour
  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previous = meta?.content;
    root.style.setProperty("--chrome-tint", tint.top);
    if (meta) meta.content = tint.top;
    return () => {
      root.style.removeProperty("--chrome-tint");
      if (meta && previous) meta.content = previous;
    };
  }, [tint.top]);

  const vars = {
    "--chrome-top": tint.top,
    "--chrome-bottom": tint.bottom,
    "--chrome-accent": tint.accent,
  } as CSSProperties;
  const topBar: CSSProperties = {
    backgroundColor: "color-mix(in srgb, var(--chrome-top) 90%, transparent)",
    borderColor: "color-mix(in srgb, var(--chrome-accent) 28%, transparent)",
  };
  const bottomBar: CSSProperties = {
    backgroundColor: "color-mix(in srgb, var(--chrome-bottom) 92%, transparent)",
    borderColor: "color-mix(in srgb, var(--chrome-accent) 28%, transparent)",
  };

  return (
    <ChromeContext.Provider value={chromeValue}>
      <div
        className="relative min-h-dvh transition-colors duration-700 lg:flex"
        style={
          onRoadmap
            ? { ...vars, backgroundColor: "color-mix(in srgb, var(--chrome-bottom) 55%, #0b0b0d)", backgroundImage: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--chrome-accent) 22%, transparent), transparent 60%)" }
            : vars
        }
      >
        {/* ambient glow in the accent colour (static: the classic orange, or the venue colour on the roadmap), the sticky header wears the same colour as the status strip, so the top edge has no seam */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
          <div className="absolute -top-44 left-1/2 size-[520px] -translate-x-1/2 rounded-full opacity-25 blur-[120px] transition-colors duration-700" style={{ backgroundColor: "var(--chrome-accent)" }} />
        </div>

        {/* desktop side bar */}
        <aside className="sticky top-0 z-30 hidden h-dvh w-72 shrink-0 flex-col gap-6 border-s p-6 backdrop-blur-xl transition-colors duration-700 lg:flex" style={bottomBar}>
          <Image src="/logo-transparent.png" alt="FitFam" width={640} height={573} className="h-14 w-auto self-start" priority />

          <nav aria-label="ניווט ראשי">
            <ul className="flex flex-col gap-1.5">
              {TABS.map(({ href, label, Icon }, i) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href} className="ff-slide-in" style={{ animationDelay: `${i * 70}ms` }}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-12 items-center gap-3 rounded-xl px-4 font-heading text-body-lg font-bold transition ${
                        active ? "bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]" : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                      }`}
                      style={active ? { color: "var(--chrome-accent)" } : undefined}
                    >
                      <Icon />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            {stats && (
              <Link href="/profile" className="ff-lift flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3">
                <ProgressRing value={ratio(stats.xpIntoLevel, stats.xpForNextLevel)} size={56} stroke={5}>
                  <span dir="ltr" className="font-heading text-body-lg font-extrabold">{stats.level}</span>
                </ProgressRing>
                <div className="min-w-0">
                  <p className="truncate font-heading text-body-md font-bold">{name}</p>
                  <p className="text-label-md text-text-secondary">{rankTitle(stats.level)}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-label-md font-semibold text-ember">
                    <FlameIcon className="size-3.5" />
                    {stats.weeklyStreak} שבועות ברצף
                  </p>
                </div>
              </Link>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-body-md text-text-muted transition hover:bg-white/5 hover:text-text-primary"
            >
              <LogoutIcon className="size-4" />
              התנתקות
            </button>
          </div>
        </aside>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          {/* mobile / tablet header: sticks to the top and wears the colour of the zone under it */}
          <header className="sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-700 lg:hidden" style={topBar}>
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-gutter pt-[calc(env(safe-area-inset-top)+10px)] pb-2.5">
              <Image src="/logo-transparent.png" alt="FitFam" width={640} height={573} className="h-9 w-auto" priority />

              <Link href="/profile" aria-label="הפרופיל שלי" className="flex items-center gap-2">
                {stats && (
                  <span className="flex h-8 items-center gap-1 rounded-full border border-white/25 bg-black/25 px-2.5 font-heading text-label-md font-bold" style={{ color: "var(--chrome-accent)" }}>
                    <BoltIcon className="size-3.5" />
                    <span dir="ltr">Lv {stats.level}</span>
                  </span>
                )}
                <Avatar name={name} url={user.avatarUrl} size={36} />
              </Link>
            </div>
            {onRoadmap && <RoadmapHud className="mx-auto w-full max-w-2xl px-gutter pb-2" />}
          </header>

          <main className={`relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-gutter pb-28 lg:max-w-6xl lg:px-10 lg:pb-12 ${onRoadmap ? "pt-0 lg:pt-6" : "pt-4 lg:pt-10"}`}>{children}</main>
        </div>

        {/* mobile / tablet bottom bar: wears the colour of the zone beneath it */}
        <nav
          aria-label="ניווט ראשי"
          className="fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-colors duration-700 lg:hidden"
          style={bottomBar}
        >
          <ul className="mx-auto flex max-w-2xl">
            {TABS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href} className="flex-1">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-16 flex-col items-center justify-center gap-1 text-label-md font-semibold transition ${active ? "" : "text-white/60 hover:text-white/85"}`}
                    style={active ? { color: "var(--chrome-accent)" } : undefined}
                  >
                    {active && <span aria-hidden="true" className="ff-pop-in absolute top-0 h-0.5 w-10 rounded-full" style={{ backgroundColor: "var(--chrome-accent)", boxShadow: "0 0 12px var(--chrome-accent)" }} />}
                    <Icon className={active ? "ff-pop-in" : ""} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </ChromeContext.Provider>
  );
}
