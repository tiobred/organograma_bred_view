import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Users, Building2, Calendar, Mail, Pencil } from "lucide-react";
import { AvatarPreview } from "@/components/avatar/AvatarPreview";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function AdminPage() {
    const supabase = await createClient();

    // Fetch all profiles with department details
    const { data: profilesData, error } = await supabase
        .from("profiles")
        .select(`
            *,
            departments (
                id,
                name,
                color
            )
        `)
        .order("full_name");

    const profiles = (profilesData || []) as any[];

    if (error) {
        console.error("Error fetching profiles:", error);
    }

    // Group by department
    const profilesByDepartment = profiles?.reduce((acc, profile) => {
        const dept = (profile as any).departments?.name || "Sem Departamento";
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(profile);
        return acc;
    }, {} as Record<string, any[]>) || {};

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Voltar ao Organograma</span>
                            </Link>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Painel Administrativo
                            </h1>
                            <p className="text-sm text-gray-500">BredOrganogramaDigital</p>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href="/admin/departments"
                                className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium flex items-center gap-2"
                            >
                                <Building2 className="w-4 h-4" />
                                Departamentos
                            </Link>
                            <Link
                                href="/admin/employees/new"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                            >
                                + Novo Funcionário
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total de Colaboradores</p>
                                <p className="text-3xl font-bold text-gray-900">{profiles?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Departamentos</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {Object.keys(profilesByDepartment).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Cadastrados Esta Semana</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {profiles?.filter(p => {
                                        const created = new Date(p.created_at);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return created > weekAgo;
                                    }).length || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employees by Department */}
                <div className="space-y-6">
                    {Object.entries(profilesByDepartment as Record<string, any[]>).map(([department, deptProfiles]) => (
                        <div key={department} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    {department}
                                    <span className="ml-auto text-sm font-normal opacity-90">
                                        {deptProfiles.length} {deptProfiles.length === 1 ? "pessoa" : "pessoas"}
                                    </span>
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {deptProfiles.map((profile) => (
                                    <div
                                        key={profile.id}
                                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <AvatarPreview
                                                    url={profile.avatar_thumbnail_url || profile.avatar_url}
                                                    name={profile.full_name}
                                                    size={48}
                                                    className="ring-2 ring-gray-200"
                                                />

                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {profile.full_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {profile.position}
                                                    </p>
                                                    {profile.email && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                            <Mail className="w-3 h-3" />
                                                            {profile.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/employees/${profile.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <DeleteButton
                                                    employeeId={profile.id}
                                                    employeeName={profile.full_name}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {profiles && profiles.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Nenhum funcionário cadastrado
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Comece adicionando o primeiro funcionário da empresa
                        </p>
                        <Link
                            href="/admin/employees/new"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                            + Adicionar Primeiro Funcionário
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
