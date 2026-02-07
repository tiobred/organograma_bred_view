import imageCompression from "browser-image-compression";

export interface CompressionResult {
    fullImage: File;
    thumbnail: File;
}

/**
 * Compress and resize an image to create both full and thumbnail versions
 */
export async function compressAndResizeImage(
    file: File
): Promise<CompressionResult> {
    // Full size version (800x800 max, high quality)
    const fullImageOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85,
    };

    // Thumbnail version (150x150 max, lower quality for performance)
    const thumbnailOptions = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 150,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.7,
    };

    try {
        const [fullImage, thumbnail] = await Promise.all([
            imageCompression(file, fullImageOptions),
            imageCompression(file, thumbnailOptions),
        ]);

        return {
            fullImage: new File([fullImage], `full-${file.name}`, {
                type: "image/webp",
            }),
            thumbnail: new File([thumbnail], `thumb-${file.name}`, {
                type: "image/webp",
            }),
        };
    } catch (error) {
        console.error("Error compressing image:", error);
        throw new Error("Erro ao processar imagem");
    }
}

/**
 * Create a preview URL for an image file
 */
export function createImagePreview(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * Revoke an image preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * Load an image and get its dimensions
 */
export function getImageDimensions(
    file: File
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = createImagePreview(file);

        img.onload = () => {
            revokeImagePreview(url);
            resolve({
                width: img.width,
                height: img.height,
            });
        };

        img.onerror = () => {
            revokeImagePreview(url);
            reject(new Error("Erro ao carregar imagem"));
        };

        img.src = url;
    });
}
