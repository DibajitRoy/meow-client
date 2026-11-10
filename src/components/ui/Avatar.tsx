"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src?: string | null;
  name: string;
  size?: number; // px
  rounded?: "full" | "xl";
};

export default function Avatar({ src, name, size = 44, rounded = "full" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shape = rounded === "full" ? "rounded-full" : "rounded-xl";
  const style = { width: size, height: size };

  if (src && src !== failedSrc) {
    return <Image src={src} alt={name} width={size} height={size} unoptimized onError={() => setFailedSrc(src)} style={style} className={`${shape} shrink-0 object-cover`} />;
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.4 }}
      className={`${shape} flex shrink-0 items-center justify-center bg-brand-100 font-semibold text-brand-600`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

