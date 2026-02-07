import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Plus, Building2, Palette } from "lucide-react";
import type { Database } from "@/types/supabase";

type Department = Database["public"]["Tables"]["departments"]["Row"];

export default async function DepartmentsPage() {
    const supabase = await createClient();

    // Fetch all departments with employee count
    const { data: departmentsData, error } = await supabase
        .from("departments")
        .select(`
            *,
            profiles:profiles(count)
        `)
        .order("name");

    const departments = (departmentsData || []) as any[];

    if (error) {
        console.error("Error fetching departments:", error);
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Voltar ao Admin</span>
                            </Link>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Gerenciar Departamentos
                            </h1>
                            <p className="text-sm text-gray-500">Controle os departamentos da organização</p>
                        </div>

                        <div>
                            <Link
                                href="/admin/departments/new"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Novo Departamento
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total de Departamentos</p>
                                <p className="text-3xl font-bold text-gray-900">{departments?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Cores Configuradas</p>
                                <p className="text-3xl font-bold text-gray-900">{departments?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Palette className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments?.map((dept) => (
                        <div
                            key={dept.id}
                            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Color band */}
                            <div
                                className="h-2"
                                style={{ backgroundColor: dept.color }}
                            />

                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${dept.color}20` }}
                                        >
                                            <Building2
                                                className="w-5 h-5"
                                                style={{ color: dept.color }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{dept.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {(dept.profiles as any)?.[0]?.count || 0} funcionários
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {dept.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {dept.description}
                                    </p>
                                )}

                                {/* Color info */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div
                                        className="w-6 h-6 rounded border-2 border-gray-200"
                                        style={{ backgroundColor: dept.color }}
                                    />
                                    <code className="text-xs text-gray-500 font-mono">{dept.color}</code>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/departments/${dept.id}`}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-medium"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                        disabled={(dept.profiles as any)?.[0]?.count > 0}
                                        title={
                                            (dept.profiles as any)?.[0]?.count > 0
                                                ? "Não é possível excluir departamento com funcionários"
                                                : "Excluir departamento"
                                        }
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {departments && departments.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Nenhum departamento cadastrado
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Crie o primeiro departamento da organização
                        </p>
                        <Link
                            href="/admin/departments/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Criar Primeiro Departamento
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
