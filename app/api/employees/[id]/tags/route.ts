import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { tags } = await request.json();
        const employeeId = params.id;

        if (!Array.isArray(tags)) {
            return NextResponse.json(
                { error: "Tags deve ser um array de strings" },
                { status: 400 }
            );
        }

        // Update profile tags
        const { data: updateData, error: updateError } = await supabase
            .from("profiles")
            // @ts-ignore
            .update({ tags })
            .eq("id", employeeId)
            .select()
            .single();

        if (updateError) {
            console.error("Database error:", updateError);
            return NextResponse.json(
                { error: `Erro ao atualizar tags: ${updateError.message}` },
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
