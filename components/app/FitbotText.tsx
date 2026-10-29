import type { ReactNode } from "react";

/** **bold** inside one line; everything else stays plain text (React escapes it, so nothing from the model can inject markup). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong> : part,
  );
}

const BULLET = /^\s*[-*•]\s+/;

/** Fitbot's answers are short text with the odd bold word and dash lists: render just that, nothing more. */
export default function FitbotText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      const items = list;
      blocks.push(
        <ul key={`l${blocks.length}`} className="flex list-disc flex-col gap-1 ps-5 marker:text-ember">
          {items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (BULLET.test(line)) {
      list.push(line.replace(BULLET, ""));
      continue;
    }
    flush();
    if (line.trim()) blocks.push(<p key={`p${blocks.length}`}>{inline(line)}</p>);
  }
  flush();
  return <div dir="auto" className="flex flex-col gap-2 text-body-lg">{blocks}</div>;
}
