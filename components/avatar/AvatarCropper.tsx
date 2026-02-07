"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

interface AvatarCropperProps {
    image: string;
    onCropComplete: (croppedAreaPixels: Area) => void;
    cropShape?: "round" | "rect";
}

export function AvatarCropper({
    image,
    onCropComplete,
    cropShape = "round",
}: AvatarCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const handleCropComplete = useCallback(
        (croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
            onCropComplete(croppedAreaPixels);
        },
        [onCropComplete]
    );

    return (
        <div className="space-y-4">
            <div className="relative h-96 w-full bg-black rounded-lg overflow-hidden">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape={cropShape}
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onZoomChange={setZoom}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
        </div>
    );
}

/**
 * Create cropped image blob from area
 */
export async function createCroppedImage(
    imageSrc: string,
    pixelCrop: Area
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Failed to create blob"));
            }
        }, "image/webp");
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.src = url;
    });
}
