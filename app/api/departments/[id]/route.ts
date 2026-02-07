import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { name, description, color } = await request.json();
        const departmentId = params.id;

        // Validate required fields
        if (!name || !color) {
            return NextResponse.json(
                { error: "Nome e cor são obrigatórios" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("departments")
            // @ts-ignore
            .update({
                name,
                description,
                color,
            })
            .eq("id", departmentId)
            .select()
            .single();

        if (error) {
            console.error("Error updating department:", error);
            return NextResponse.json(
                { error: `Erro ao atualizar departamento: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const departmentId = params.id;

        // Check if department has employees
        const { count, error: countError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("department_id", departmentId);

        if (countError) {
            throw countError;
        }

        if (count && count > 0) {
            return NextResponse.json(
                { error: "Não é possível excluir um departamento com funcionários associados." },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("departments")
            .delete()
            .eq("id", departmentId);

        if (error) {
            console.error("Error deleting department:", error);
            return NextResponse.json(
                { error: `Erro ao excluir departamento: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
