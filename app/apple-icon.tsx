import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#131314",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ff5637",
            color: "#131314",
            fontSize: 80,
            fontWeight: 900,
          }}
        >
          F
        </div>
      </div>
    ),
    size,
  );
}
