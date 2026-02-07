"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { AvatarPreview } from "./AvatarPreview";

interface AvatarUploadProps {
    currentUrl?: string | null;
    onFileSelect: (file: File | null) => void;
    name?: string;
}

export function AvatarUpload({ currentUrl, onFileSelect, name = "User" }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecione uma imagem válida");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 5MB");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onFileSelect(file);
    };

    const handleRemove = () => {
        setPreview(null);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
                <AvatarPreview
                    url={preview}
                    name={name}
                    size={96}
                    className="ring-4 ring-gray-100"
                />
                {preview && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="Remover foto"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Upload Button */}
            <div className="flex-1">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                />
                <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium"
                >
                    <Upload className="w-4 h-4" />
                    {preview ? "Alterar Foto" : "Fazer Upload"}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG ou WebP. Máximo 5MB.
                </p>
            </div>
        </div>
    );
}
