"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Plus, Tag } from "lucide-react";

interface ManageTagsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
    initialTags: string[];
}

export function ManageTagsDialog({
    isOpen,
    onClose,
    employeeId,
    employeeName,
    initialTags
}: ManageTagsDialogProps) {
    const router = useRouter();
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTags(initialTags || []);
            setNewTag("");
        }
    }, [isOpen, initialTags]);

    const handleAddTag = () => {
        if (!newTag.trim()) return;

        const tag = newTag.trim();
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setNewTag("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/employees/${employeeId}/tags`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tags }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erro ao atualizar tags");
            }

            onClose();
            router.refresh();
        } catch (error) {
            console.error("Save error:", error);
            alert("Erro ao atualizar tags. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10010] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-600" />
                            Gerenciar Tags
                        </h3>
                        <p className="text-sm text-gray-500">
                            Tags para <span className="font-medium text-gray-900">{employeeName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Add Tag Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nova tag..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                        <button
                            onClick={handleAddTag}
                            disabled={!newTag.trim()}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tags List */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Tags Atuais
                        </p>
                        <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-gray-50 rounded-xl border border-gray-100">
                            {tags.length > 0 ? (
                                tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 shadow-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-red-500 transition-colors p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic w-full text-center py-8">
                                    Nenhuma tag adicionada
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>
            </div>
        </div>
    );
}
