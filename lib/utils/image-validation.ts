/**
 * Validate file type using magic numbers (file signatures)
 * Prevents malicious files disguised as images
 */
export async function validateImageMagicNumber(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onloadend = (e) => {
            if (!e.target?.result) {
                resolve(false);
                return;
            }

            const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 4);
            let header = "";
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16).padStart(2, "0");
            }

            // Check magic numbers for common image formats
            const validHeaders = [
                "ffd8ffe0", // JPEG
                "ffd8ffe1", // JPEG
                "ffd8ffe2", // JPEG
                "ffd8ffe3", // JPEG
                "ffd8ffe8", // JPEG
                "89504e47", // PNG
                "47494638", // GIF
                "52494646", // WEBP (starts with RIFF)
            ];

            const isValid = validHeaders.some((validHeader) =>
                header.startsWith(validHeader)
            );

            resolve(isValid);
        };

        reader.readAsArrayBuffer(file.slice(0, 4));
    });
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 2): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Validate MIME type
 */
export function validateMimeType(file: File): boolean {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    return validTypes.includes(file.type);
}

/**
 * Comprehensive image validation
 */
export async function validateImage(file: File): Promise<{
    valid: boolean;
    error?: string;
}> {
    // Check MIME type
    if (!validateMimeType(file)) {
        return {
            valid: false,
            error: "Formato de arquivo inválido. Use JPEG, PNG ou WebP.",
        };
    }

    // Check file size (2MB limit)
    if (!validateFileSize(file, 2)) {
        return {
            valid: false,
            error: "Arquivo muito grande. Tamanho máximo: 2MB.",
        };
    }

    // Check magic number (prevent malware)
    const validMagicNumber = await validateImageMagicNumber(file);
    if (!validMagicNumber) {
        return {
            valid: false,
            error: "Arquivo corrompido ou inválido.",
        };
    }

    return { valid: true };
}
