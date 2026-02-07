import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { manager_id, is_advisor } = await request.json();
        const employeeId = params.id;

        // Validate - prevent circular references
        if (manager_id === employeeId) {
            return NextResponse.json(
                { error: "Um funcionário não pode ser seu próprio gestor" },
                { status: 400 }
            );
        }

        // Check if new manager exists (if provided)
        if (manager_id) {
            const { data: managerExists } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", manager_id)
                .single();

            if (!managerExists) {
                return NextResponse.json(
                    { error: "Gestor não encontrado" },
                    { status: 404 }
                );
            }
        }

        // Update profile manager and advisor status
        // Using 'as any' cast to bypass strict typing on updates if types are lagging
        // Update profile manager and advisor status
        // Using 'as any' cast to bypass strict typing on updates if types are lagging
        const { data: updateData, error: updateError } = await supabase
            .from("profiles")
            // @ts-ignore
            .update({
                manager_id: manager_id || null,
                is_advisor: is_advisor || false
            })
            .eq("id", employeeId)
            .select()
            .single();

        if (updateError) {
            console.error("Database error:", updateError);
            return NextResponse.json(
                { error: `Erro ao atualizar gestor: ${updateError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: updateData }, { status: 200 });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Desconhecido'}` },
            { status: 500 }
        );
    }
}
