import Image from "next/image";

/** Fitbot's face: the glowing orb. Size it with a class (default 40 px); it is decorative, the name always sits next to it. */
export default function FitbotLogo({ className = "size-10", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/fitbot.png" alt="" width={256} height={256} priority={priority} draggable={false} className={`shrink-0 select-none object-contain ${className}`} />;
}

/** The tab icon of the Fitbot tab (the other tabs use line icons that take the tab colour; Fitbot keeps its own look). */
export function FitbotTabIcon({ className = "size-6" }: { className?: string }) {
  return <FitbotLogo className={className} />;
}
