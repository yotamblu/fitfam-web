import { ImageResponse } from "next/og";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export const dynamic = "force-static";

export async function GET(_req: Request, ctx: RouteContext<"/icons/[size]">) {
  const { size } = await ctx.params;
  const px = size === "512" ? 512 : 192;
  return new ImageResponse(<FitFamMark px={px} />, { width: px, height: px });
}

function FitFamMark({ px }: { px: number }) {
  return (
    <div
      style={{
        width: px,
        height: px,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#131314",
      }}
    >
      <div
        style={{
          width: px * 0.6,
          height: px * 0.6,
          borderRadius: px * 0.18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff5637",
          color: "#131314",
          fontSize: px * 0.42,
          fontWeight: 900,
        }}
      >
        F
      </div>
    </div>
  );
}
