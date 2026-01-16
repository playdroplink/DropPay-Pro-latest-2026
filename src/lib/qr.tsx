import React from "react";
import { renderToString } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import droppayLogo from "@/assets/droppay-logo.png";

// Generates a PNG data URL QR code with the DropPay logo centered.
export async function buildCheckoutQr(value: string, size = 480): Promise<string> {
  const svgMarkup = renderToString(
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      includeMargin
      bgColor="#ffffff"
      fgColor="#000000"
      imageSettings={{
        src: droppayLogo,
        width: size * 0.2,
        height: size * 0.2,
        excavate: true,
      }}
    />
  );

  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas is not supported"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject(new Error("Failed to render QR code"));
    img.src = svgDataUrl;
  });
}
