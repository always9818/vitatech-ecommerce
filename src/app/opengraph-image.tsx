import { ImageResponse } from "next/og";

/**
 * Sin parámetros dinámicos, Next la genera UNA vez en build (Node normal, no
 * el runtime de Workers) y la sirve como archivo estático — igual que
 * /icon.svg y /apple-icon.png, que ya funcionan así en este mismo despliegue.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d1405",
          color: "#e7e5e4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 108, fontWeight: 800 }}>
          <span style={{ color: "#ffffff" }}>VITA</span>
          <span style={{ color: "#a3e635", marginLeft: -14 }}>TECH_</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 34, color: "#a8a29e" }}>
          Tecnología y accesorios con envío a todo Guatemala
        </div>
        <div
          style={{
            marginTop: 36,
            width: 160,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#a3e635",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
