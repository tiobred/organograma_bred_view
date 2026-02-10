import { createClient as createNextClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Database } from "@/types/supabase";

export async function POST(request: NextRequest) {
    try {
        let supabase: any;
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            supabase = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
        } else {
            supabase = await createNextClient();
        }

        const formData = await request.formData();

        // Extract form fields
        const full_name = formData.get("full_name") as string;
        const email = formData.get("email") as string;
        const position = formData.get("position") as string;
        const department_id = formData.get("department_id") as string;
        const manager_id = formData.get("manager_id") as string || null;
        const bio = formData.get("bio") as string || null;
        const is_advisor = formData.get("is_advisor") === "true";
        const responsibilities = formData.get("responsibilities") as string || null;
        const avatarFile = formData.get("avatar") as File | null;

        let tags: string[] = [];
        const tagsRaw = formData.get("tags");
        if (tagsRaw) {
            try {
                tags = JSON.parse(tagsRaw as string);
            } catch (e) {
                console.error("Error parsing tags:", e);
                tags = [];
            }
        }

        // Validate required fields
        if (!full_name || !email || !position) {
            return NextResponse.json(
                { error: "Nome, email e cargo são obrigatórios" },
                { status: 400 }
            );
        }

        const profileId = uuidv4();
        let avatar_url: string | null = null;
        let avatar_thumbnail_url: string | null = null;

        // Upload avatar if provided
        if (avatarFile && avatarFile.size > 0) {
            const fileExt = avatarFile.name.split(".").pop();
            const fileName = `${profileId}.${fileExt}`;
            const filePath = `profiles/${fileName}`;

            const arrayBuffer = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, buffer, {
                    contentType: avatarFile.type,
                    upsert: true,
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return NextResponse.json(
                    { error: `Erro ao fazer upload da imagem: ${uploadError.message}` },
                    { status: 500 }
                );
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            avatar_url = urlData.publicUrl;
            avatar_thumbnail_url = urlData.publicUrl;
        }

        // Insert profile
        const { data, error } = await supabase
            .from("profiles")
            .insert([{
                id: profileId,
                full_name,
                email,
                position,
                department_id: department_id || null,
                manager_id: manager_id || null,
                bio,
                avatar_url,

                metadata: { role: "user" },

                is_advisor,
                responsibilities,
                tags,
            }])
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: `Erro ao criar funcionário: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Desconhecido'}` },
            { status: 500 }
        );
    }
}
