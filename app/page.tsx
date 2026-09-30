import Image from "next/image";
import AuthActions from "@/components/AuthActions";
import HeroVisual from "@/components/hero/HeroVisual";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center overflow-hidden bg-canvas px-gutter pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* ambient glows + grid */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-ember/25 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-24 size-[360px] rounded-full bg-volt/10 blur-[110px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 10%, transparent 70%)",
        }}
      />

      {/* grid fades in from the status-bar tint colour (iOS paints that strip as one flat colour) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-status-tint via-status-tint/60 to-transparent" />

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-between gap-6 py-6">
        {/* brand */}
        <header className="animate-rise">
          <Image src="/logo-transparent.png" alt="FitFam" width={640} height={573} priority className="h-16 w-auto" />
        </header>

        <section className="flex w-full flex-col items-center gap-6" aria-labelledby="hero-title">
          <div className="animate-rise flex w-full shrink-0 justify-center"><HeroVisual /></div>

          <div className="animate-rise text-center [animation-delay:120ms]">
            <h1 id="hero-title" className="font-heading text-[32px] leading-10 font-extrabold tracking-tight">
              תוכנית אימון
              <br />
              שמרגישה <span className="text-ember">כמו משחק.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-body-lg text-text-secondary">
              כל שבוע הוא שלב חדש. מסיימים אימון, פותחים את הבא, ורואים את עצמכם מתקדמים.
            </p>
          </div>
        </section>

        {/* actions */}
        <section className="animate-rise w-full [animation-delay:320ms]">
          <AuthActions />
          <p className="mt-5 text-center text-label-md text-text-muted">
            ממשיכים רק עם חשבון Google. אנחנו מקבלים רק שם, אימייל ותמונה.
          </p>
        </section>
      </div>
    </main>
  );
}
