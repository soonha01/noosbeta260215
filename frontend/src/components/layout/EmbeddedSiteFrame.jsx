import React, { useState } from "react";

const EmbeddedSiteFrame = ({ src, title, entryTone = "dark" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const usesLightPage = entryTone === "light" || entryTone === "light-to-dark";

  return (
    <div className={`relative h-screen w-full overflow-hidden ${usesLightPage ? "bg-white" : "bg-black"}`}>
      <iframe
        title={title}
        src={src}
        onLoad={() => {
          window.setTimeout(() => setIsLoaded(true), 120);
        }}
        className={`h-screen w-full border-0 ${usesLightPage ? "bg-white" : "bg-black"}`}
        allow="autoplay; fullscreen"
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[80] bg-black transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
};

export default EmbeddedSiteFrame;
