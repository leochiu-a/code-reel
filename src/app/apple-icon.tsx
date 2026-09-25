import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#181818",
      }}
    >
      <svg width="140" height="140" viewBox="4 4 24 24">
        <path
          d="M12 9.5 5.5 16l6.5 6.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.5 10.2v11.6a1 1 0 0 0 1.5.86l9.3-5.8a1 1 0 0 0 0-1.72l-9.3-5.8a1 1 0 0 0-1.5.86Z"
          fill="#ffffff"
        />
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
