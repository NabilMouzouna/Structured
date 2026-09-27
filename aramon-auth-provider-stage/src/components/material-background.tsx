"use client";

import { useEffect, useState } from "react";

const poster = "https://ui.aramon.ma/aramon/material/material-background.webp";

export function MaterialBackground() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
    setPlay(!reduced && !slow);
  }, []);

  return (
    <div className="material-background" aria-hidden="true">
      <div className="material-scrim" />
      {play ? (
        <video autoPlay muted playsInline loop preload="metadata" poster={poster} className="material-media">
          <source src="https://ui.aramon.ma/aramon/material/material-background.webm" type="video/webm" />
          <source src="https://ui.aramon.ma/aramon/material/material-background.mp4" type="video/mp4" />
        </video>
      ) : <div className="material-poster" style={{ backgroundImage: `url(${poster})` }} />}
    </div>
  );
}
