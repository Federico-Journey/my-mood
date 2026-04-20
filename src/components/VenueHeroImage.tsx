"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  fallbackEmoji: string;
  accentColor: string;
};

export default function VenueHeroImage({ src, alt, fallbackEmoji, accentColor }: Props) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${accentColor}30, #09090f)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "72px",
        }}
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setImgError(true)}
    />
  );
}
