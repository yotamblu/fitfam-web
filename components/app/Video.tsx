"use client";

import { useState } from "react";

/** A YouTube clip that only loads (from the privacy-friendly domain) after the customer taps to watch it. */
export default function Video({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border-emphasis px-3 text-label-md font-semibold text-info transition hover:bg-surface-raised"
      >
        ▶ צפייה בסרטון
      </button>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0`}
        title={`סרטון: ${title}`}
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="size-full"
      />
    </div>
  );
}
