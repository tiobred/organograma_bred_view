"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, UserCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AvatarPreview } from "@/components/avatar/AvatarPreview";
import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ChangeManagerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
    currentManagerId: string | null;
}

export function ChangeManagerDialog({
    isOpen,
    onClose,
    employeeId,
    employeeName,
    currentManagerId
}: ChangeManagerDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(currentManagerId);
    const [isAdvisor, setIsAdvisor] = useState(false);

    // Fetch potential managers
    useEffect(() => {
        if (isOpen) {
            const fetchProfiles = async () => {
                setLoading(true);
                try {
                    const supabase = createClient();
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .neq("id", employeeId) // Exclude current employee
                        .order("full_name");

                    if (error) throw error;
                    setProfiles(data || []);
                } catch (error) {
                    console.error("Error fetching profiles:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProfiles();
            // Reset selection to current manager when opening
            setSelectedManagerId(currentManagerId);
            setIsAdvisor(false); // Default to false, ideally we should fetch current status but for now reset
            setSearchTerm("");
        }
    }, [isOpen, employeeId, currentManagerId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/employees/${employeeId}/manager`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    manager_id: selectedManagerId,
                    is_advisor: isAdvisor
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erro ao atualizar gestor");
            }

            onClose();
            router.refresh();
        } catch (error) {
            console.error("Save error:", error);
            alert("Erro ao atualizar gestor. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    // Filter profiles based on search
    const filteredProfiles = profiles.filter(profile =>
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10010] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Alterar Gestor</h3>
                        <p className="text-sm text-gray-500">
                            Defina o gestor direto de <span className="font-medium text-gray-900">{employeeName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou cargo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Carregando colaboradores...
                        </div>
                    ) : (
                        <>
                            {/* Option for No Manager */}
                            <div
                                onClick={() => setSelectedManagerId(null)}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                                    ${selectedManagerId === null
                                        ? "bg-blue-50 border-blue-200 ring-1 ring-blue-500"
                                        : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                                    }
                                `}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <UserCheck className={`w-5 h-5 ${selectedManagerId === null ? "text-blue-600" : "text-gray-400"}`} />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${selectedManagerId === null ? "text-blue-700" : "text-gray-900"}`}>
                                        Sem Gestor
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Definir como topo da hierarquia (CEO/Diretor)
                                    </p>
                                </div>
                                {selectedManagerId === null && (
                                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                                )}
                            </div>

                            {/* Profiles List */}
                            {filteredProfiles.length > 0 ? (
                                filteredProfiles.map((profile) => (
                                    <div
                                        key={profile.id}
                                        onClick={() => setSelectedManagerId(profile.id)}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                                            ${selectedManagerId === profile.id
                                                ? "bg-blue-50 border-blue-200 ring-1 ring-blue-500"
                                                : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                                            }
                                        `}
                                    >
                                        <AvatarPreview
                                            url={profile.avatar_url}
                                            name={profile.full_name}
                                            size={40}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${selectedManagerId === profile.id ? "text-blue-700" : "text-gray-900"}`}>
                                                {profile.full_name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {profile.position}
                                            </p>
                                        </div>
                                        {selectedManagerId === profile.id && (
                                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-gray-500 text-sm">
                                    Nenhum funcionário encontrado.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Advisor Checkbox */}
                {selectedManagerId && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center">
                            <input
                                id="is_advisor_dialog"
                                type="checkbox"
                                checked={isAdvisor}
                                onChange={(e) => setIsAdvisor(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_advisor_dialog" className="ml-2 block text-sm text-gray-700">
                                Cargo de Assessoria / Staff (Linha tracejada)
                            </label>
                        </div>
                    </div>
                )}

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
