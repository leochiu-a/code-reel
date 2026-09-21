import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#181818",
        padding: "80px",
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-2px",
          lineHeight: 1,
          marginBottom: 24,
        }}
      >
        CodeReel
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.6)",
          letterSpacing: "-0.5px",
          textAlign: "center",
        }}
      >
        Animate your code. Share your story.
      </div>
    </div>,
    {
      ...size,
    },
  );
}
