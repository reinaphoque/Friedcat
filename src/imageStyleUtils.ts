import React from "react";
import { ImageStyleConfig } from "./types";

/** Returns inline style overrides for the image *container* when custom width/height are set. */
export const getContainerSizeStyle = (config?: ImageStyleConfig): React.CSSProperties => {
  if (config?.width == null && config?.height == null) return {};
  return {
    ...(config.width != null ? { width: `${config.width}px` } : {}),
    ...(config.height != null ? { height: `${config.height}px` } : {}),
  };
};

/** Returns inline styles for the <img> element — scale, position, and fit mode. */
export const getImageStyleHelper = (config?: ImageStyleConfig) => {
  if (!config) return { objectFit: "cover" as const, objectPosition: "center", transform: "none" };
  const scale = config.scale !== undefined ? config.scale : 100;
  const posX = config.posX !== undefined ? config.posX : 50;
  const posY = config.posY !== undefined ? config.posY : 50;
  const fit = config.fit || "cover";

  if (fit === "contain") {
    return {
      objectFit: "contain" as const,
      objectPosition: "center center",
      transform: `scale(${scale / 100})`,
      transformOrigin: "center center",
    };
  }

  const scaleVal = scale / 100;
  // Translate so the focal point stays centred as zoom increases.
  const tx = scaleVal > 1 ? -(posX - 50) * (scaleVal - 1) / scaleVal : 0;
  const ty = scaleVal > 1 ? -(posY - 50) * (scaleVal - 1) / scaleVal : 0;

  return {
    objectFit: "cover" as const,
    objectPosition: `${posX}% ${posY}%`,
    transform: `scale(${scaleVal}) translate(${tx}%, ${ty}%)`,
    transformOrigin: "center center",
  };
};
