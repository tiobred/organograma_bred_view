import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DepartmentForm } from "@/components/forms/DepartmentForm";

export default async function EditDepartmentPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const supabase = await createClient();

    const { data: department, error } = await supabase
        .from("departments")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error || !department) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/admin/departments"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </Link>

                <div className="bg-white rounded-xl shadow-md p-8">
                    <h1 className="text-2xl font-bold mb-6">Editar Departamento</h1>

                    <DepartmentForm
                        initialData={department}
                        mode="edit"
                    />
                </div>
            </div>
        </main>
    );
}
