import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmployeeForm } from "@/components/forms/EmployeeForm";

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
            *,
            departments (
                id,
                name
            )
        `)
        .eq("id", params.id)
        .single();

    // Fetch all profiles to use as potential managers
    const { data: managers } = await supabase
        .from("profiles")
        .select("id, full_name, position")
        .order("full_name");

    if (error || !profile) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">
                        Funcionário não encontrado
                    </h1>
                    <Link
                        href="/admin"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Voltar ao Admin
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar</span>
                        </Link>
                        <div className="flex-1 text-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Editar Funcionário
                            </h1>
                            <p className="text-sm text-gray-500">BredOrganogramaDigital</p>
                        </div>
                        <div className="w-20"></div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-6 py-8 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <EmployeeForm
                        initialData={profile}
                        managers={managers || []}
                        mode="edit"
                    />
                </div>
            </div>
        </main>
    );
}
