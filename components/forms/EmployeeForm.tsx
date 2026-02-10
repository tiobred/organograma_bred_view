"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/avatar/AvatarUpload";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EmployeeFormProps {
    initialData?: {
        id?: string;
        full_name: string;
        email: string;
        position: string;
        department_id: string | null;
        manager_id: string | null;
        bio: string | null;
        avatar_url: string | null;

        is_advisor?: boolean;
        responsibilities?: string | null;
        tags?: string[] | null;
    };
    managers: Array<{
        id: string;
        full_name: string;
        position: string;
    }>;
    mode: "create" | "edit";
}

export function EmployeeForm({ initialData, managers, mode }: EmployeeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [departments, setDepartments] = useState<Array<{ id: string, name: string, color: string }>>([]);
    const [loadingDepts, setLoadingDepts] = useState(true);

    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || "",
        email: initialData?.email || "",
        position: initialData?.position || "",
        department_id: initialData?.department_id || "",
        manager_id: initialData?.manager_id || "",
        bio: initialData?.bio || "",

        is_advisor: initialData?.is_advisor || false,
        responsibilities: initialData?.responsibilities || "",
        tags: initialData?.tags || [] as string[],
    });

    const [tagInput, setTagInput] = useState("");

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
                });
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // Fetch departments on mount
    useEffect(() => {
        async function fetchDepartments() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('departments')
                    .select('id, name, color')
                    .order('name');

                if (error) throw error;
                setDepartments(data || []);
            } catch (err) {
                console.error('Error fetching departments:', err);
            } finally {
                setLoadingDepts(false);
            }
        }
        fetchDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const endpoint = mode === "create"
                ? "/api/employees/create"
                : `/api/employees/${initialData?.id}`;

            const body = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'tags') {
                    body.append(key, JSON.stringify(value));
                } else {
                    body.append(key, String(value));
                }
            });

            if (avatarFile) {
                body.append("avatar", avatarFile);
            }

            const response = await fetch(endpoint, {
                method: "POST",
                body,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erro ao salvar funcionário");
            }

            router.push("/admin");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            {/* Avatar Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto de Perfil
                </label>
                <AvatarUpload
                    currentUrl={initialData?.avatar_url}
                    onFileSelect={setAvatarFile}
                    name={formData.full_name || "Novo Funcionário"}
                />
            </div>

            {/* Name */}
            <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                </label>
                <input
                    type="text"
                    id="full_name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: João Silva"
                />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                </label>
                <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="joao.silva@empresa.com"
                />
            </div>

            {/* Position */}
            <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                </label>
                <input
                    type="text"
                    id="position"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Desenvolvedor Sênior"
                />
            </div>

            {/* Department - Dropdown */}
            <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                </label>
                {loadingDepts ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando departamentos...
                    </div>
                ) : (
                    <select
                        id="department_id"
                        required
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="">Selecione um departamento</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Manager */}
            <div>
                <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Gestor Direto
                </label>
                <select
                    id="manager_id"
                    value={formData.manager_id}
                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Sem gestor (CEO/Diretor)</option>
                    {managers
                        .filter(m => m.id !== initialData?.id)
                        .map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.full_name} - {manager.position}
                            </option>
                        ))}
                </select>

                <div className="mt-2 flex items-center">
                    <input
                        id="is_advisor"
                        type="checkbox"
                        checked={formData.is_advisor}
                        onChange={(e) => setFormData({ ...formData, is_advisor: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_advisor" className="ml-2 block text-sm text-gray-700">
                        Cargo de Assessoria / Staff (Linha tracejada no organograma)
                    </label>
                </div>
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia / Descrição
                </label>
                <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Breve descrição sobre o funcionário..."
                />
            </div>

            {/* Responsibilities */}
            <div>
                <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-2">
                    Papéis e Responsabilidades
                </label>
                <textarea
                    id="responsibilities"
                    rows={5}
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva as principais responsabilidades, projetos e atribuições deste cargo..."
                />
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Etiquetas)
                </label>
                <div className="space-y-3">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite uma tag e pressione Enter..."
                    />
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1.5 inline-flex items-center justify-center text-blue-400 hover:text-blue-600 focus:outline-none"
                                >
                                    <span className="sr-only">Remover tag</span>
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Salvando..." : mode === "create" ? "Criar Funcionário" : "Salvar Alterações"}
                </button>
            </div>
        </form>
    );
}
