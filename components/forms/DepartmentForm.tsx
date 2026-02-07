"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Department {
    id: string;
    name: string;
    description: string | null;
    color: string;
}

interface DepartmentFormProps {
    initialData?: Department;
    mode: "create" | "edit";
}

export function DepartmentForm({ initialData, mode }: DepartmentFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const color = formData.get("color") as string;

        try {
            if (mode === "create") {
                const { error: createError } = await supabase
                    .from("departments")
                    // @ts-ignore
                    .insert([
                        {
                            name,
                            description: description || null,
                            color,
                        },
                    ]);

                if (createError) throw createError;
            } else {
                if (!initialData?.id) throw new Error("ID do departamento não encontrado");

                const { error: updateError } = await fetch(`/api/departments/${initialData.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        description: description || null,
                        color,
                    }),
                }).then(async (res) => {
                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || "Erro ao atualizar departamento");
                    }
                    return res.json();
                });
            }

            router.push("/admin/departments");
            router.refresh();
        } catch (err) {
            console.error("Erro ao salvar departamento:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={initialData?.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={initialData?.description || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="color"
                        id="color"
                        name="color"
                        required
                        defaultValue={initialData?.color || "#3B82F6"}
                        className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                    />
                    <div className="text-sm text-gray-500">
                        Selecione a cor que representará este departamento no organograma.
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        mode === "create" ? "Criar Departamento" : "Salvar Alterações"
                    )}
                </button>
            </div>
        </form>
    );
}
