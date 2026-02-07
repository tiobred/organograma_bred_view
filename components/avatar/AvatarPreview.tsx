"use client";

import { useState } from "react";
import Image from "next/image";
import { AvatarFallback } from "./AvatarFallback";

interface AvatarPreviewProps {
    url?: string | null;
    name: string;
    size?: number;
    className?: string;
}

export function AvatarPreview({
    url,
    name,
    size = 40,
    className = "",
}: AvatarPreviewProps) {
    const [imageError, setImageError] = useState(false);

    if (!url || imageError) {
        return <AvatarFallback name={name} size={size} className={className} />;
    }

    return (
        <div
            className={`relative overflow-hidden rounded-full ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src={url}
                alt={name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes={`${size}px`}
            />
        </div>
    );
}
