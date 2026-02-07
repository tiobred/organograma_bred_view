import { createClient } from "@/lib/supabase/server";
import { OrgChartCanvas } from "@/components/org-chart";
import type { Database } from "@/types/supabase";
import Link from "next/link";
import { Users, Plus, Settings } from "lucide-react";

type ProfileWithDepartment = Database["public"]["Tables"]["profiles"]["Row"] & {
    departments: {
        id: string;
        name: string;
        color: string;
    } | null;
};

export default async function Home() {
    const supabase = await createClient();

    // Fetch all profiles from Supabase with department details
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
            *,
            departments (
                id,
                name,
                color
            )
        `)
        .order("full_name")
        .returns<ProfileWithDepartment[]>();

    if (error) {
        console.error("Error fetching profiles:", error);
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center p-8">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">
                        Erro ao Carregar Dados
                    </h1>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <Link
                        href="/admin"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Ir para Admin
                    </Link>
                </div>
            </main>
        );
    }

    const departmentCount = new Set(
        profiles?.map(p => p.departments?.name).filter(Boolean)
    ).size;

    return (
        <main className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 z-50 shadow-sm flex-none">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    BredOrganogramaDigital
                                </h1>
                                <p className="text-xs text-gray-500">
                                    Organograma Corporativo
                                </p>
                            </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    {profiles?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Colaboradores · {departmentCount} Departamentos
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href="/admin"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Funcionário
                                </Link>
                                <Link
                                    href="/admin"
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Admin
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Org Chart */}
            <div className="flex-1 w-full bg-gray-50 relative overflow-hidden">
                {profiles && profiles.length > 0 ? (
                    <div className="absolute inset-0">
                        <OrgChartCanvas profiles={profiles as ProfileWithDepartment[]} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md mx-auto">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Nenhum colaborador cadastrado
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Comece adicionando funcionários para visualizar o organograma
                            </p>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Adicionar Primeiro Funcionário
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
