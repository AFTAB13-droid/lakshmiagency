"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Package } from "lucide-react";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  fallbackText?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc,
  fallbackText,
  className = "",
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackSrc) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackSrc}
          alt={alt || "Product image"}
          className={className}
          loading="lazy"
        />
      );
    }

    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-plum-100/70 to-lotus-100/50 text-plum-900 ${className}`}>
        <Package className="w-8 h-8 opacity-40 mb-1 text-plum-800" />
        <span className="text-[10px] font-bold text-plum-700 uppercase tracking-wider">
          {fallbackText || "Lakshmi Deal"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Product image"}
      unoptimized
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
}
