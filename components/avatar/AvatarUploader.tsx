"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { AvatarCropper, createCroppedImage } from "./AvatarCropper";
import { validateImage } from "@/lib/utils/image-validation";
import { compressAndResizeImage } from "@/lib/utils/image-compression";
import { formatFileSize } from "@/lib/utils";
import { Area } from "react-easy-crop";

interface AvatarUploaderProps {
    onUpload: (fullImage: File, thumbnail: File) => Promise<void>;
    currentAvatarUrl?: string | null;
    profileName: string;
}

export function AvatarUploader({
    onUpload,
    currentAvatarUrl,
    profileName,
}: AvatarUploaderProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setError(null);
        setIsProcessing(true);

        // Validate image
        const validation = await validateImage(file);
        if (!validation.valid) {
            setError(validation.error || "Arquivo inválido");
            setIsProcessing(false);
            return;
        }

        // Create preview
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);
        setOriginalFile(file);
        setShowCropper(true);
        setIsProcessing(false);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
        },
        maxFiles: 1,
        multiple: false,
    });

    const handleUpload = async () => {
        if (!previewUrl || !originalFile || !croppedAreaPixels) return;

        setIsProcessing(true);
        setError(null);
        setUploadProgress(0);

        try {
            // Create cropped image
            setUploadProgress(20);
            const croppedBlob = await createCroppedImage(previewUrl, croppedAreaPixels);
            const croppedFile = new File([croppedBlob], originalFile.name, {
                type: "image/webp",
            });

            // Compress and create thumbnail
            setUploadProgress(50);
            const { fullImage, thumbnail } = await compressAndResizeImage(croppedFile);

            // Upload
            setUploadProgress(80);
            await onUpload(fullImage, thumbnail);

            setUploadProgress(100);

            // Cleanup
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setOriginalFile(null);
            setShowCropper(false);
            setCroppedAreaPixels(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao fazer upload");
        } finally {
            setIsProcessing(false);
            setUploadProgress(0);
        }
    };

    const handleCancel = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setOriginalFile(null);
        setShowCropper(false);
        setCroppedAreaPixels(null);
        setError(null);
    };

    return (
        <div className="space-y-4">
            {!showCropper ? (
                <div
                    {...getRootProps()}
                    className={`
            relative border-2 border-dashed rounded-xl p-8
            transition-all duration-200 cursor-pointer
            ${isDragActive
                            ? "border-primary bg-primary/5 scale-105"
                            : "border-gray-300 hover:border-primary hover:bg-gray-50"
                        }
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                        <div
                            className={`
              p-4 rounded-full transition-colors
              ${isDragActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}
            `}
                        >
                            <Upload className="w-8 h-8" />
                        </div>

                        <div>
                            <p className="text-lg font-medium">
                                {isDragActive
                                    ? "Solte a imagem aqui..."
                                    : "Arraste uma foto ou clique para selecionar"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                JPG, PNG ou WebP • Máximo 2MB
                            </p>
                        </div>

                        {currentAvatarUrl && (
                            <p className="text-xs text-muted-foreground">
                                Uma nova foto substituirá a atual
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <AvatarCropper
                        image={previewUrl!}
                        onCropComplete={setCroppedAreaPixels}
                        cropShape="round"
                    />

                    {originalFile && (
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-sm font-medium">{originalFile.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({formatFileSize(originalFile.size)})
                                </span>
                            </div>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Processando...</span>
                                <span className="font-medium">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-300 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>

                        <button
                            onClick={handleUpload}
                            disabled={isProcessing || !croppedAreaPixels}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Salvar Foto
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
