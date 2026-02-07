import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const formData = await request.formData();
        const profileId = params.id;

        // Extract form fields
        const full_name = formData.get("full_name") as string;
        const email = formData.get("email") as string;
        const position = formData.get("position") as string;
        const department_id = formData.get("department_id") as string;
        const manager_id = formData.get("manager_id") as string;
        const bio = formData.get("bio") as string || null;
        const is_advisor = formData.get("is_advisor") === "true";
        const responsibilities = formData.get("responsibilities") as string || null;
        const avatarFile = formData.get("avatar") as File | null;

        // Validate required fields
        if (!full_name || !email || !position) {
            return NextResponse.json(
                { error: "Nome, email e cargo são obrigatórios" },
                { status: 400 }
            );
        }

        // Get existing profile
        // @ts-ignore
        const { data: existingProfileData, error: fetchError } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", profileId)
            .single();

        const existingProfile = existingProfileData as any;

        if (fetchError) {
            console.error("Error fetching existing profile:", fetchError);
            // Proceeding carefully, assuming permissions might hide data
        }

        let avatar_url: string | null = existingProfile?.avatar_url || null;
        let avatar_thumbnail_url: string | null = existingProfile?.avatar_url || null;

        // Upload new avatar if provided
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

        // Update profile
        const { data: updateData, error: updateError } = await supabase
            .from("profiles")
            // @ts-ignore
            .update({
                full_name,
                email: email || null,
                position,
                department_id: department_id || null,
                avatar_url: avatar_url !== undefined ? avatar_url : undefined,
                avatar_thumbnail_url: avatar_thumbnail_url !== undefined ? avatar_thumbnail_url : undefined,

                is_advisor,
                responsibilities,
            })
            .eq("id", profileId)
            .select()
            .single();

        if (updateError) {
            console.error("Database error during update:", updateError);
            // Check for RLS or Not Found
            if (updateError.code === "PGRST116" || updateError.details?.includes("0 rows")) {
                return NextResponse.json(
                    { error: "Erro: Perfil não encontrado ou você não tem permissão para editá-lo." },
                    { status: 403 }
                );
            }
            return NextResponse.json(
                { error: `Erro ao atualizar funcionário: ${updateError.message}` },
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

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const profileId = params.id;

        // Delete avatar from storage if exists
        const { data: profileData } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", profileId)
            .single();

        const profile = profileData as any;

        if (profile?.avatar_url) {
            const filePath = profile.avatar_url.split("/avatars/")[1];
            if (filePath) {
                await supabase.storage.from("avatars").remove([filePath]);
            }
        }

        // Delete profile
        const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", profileId);

        if (error) {
            console.error("Delete error:", error);
            return NextResponse.json(
                { error: `Erro ao excluir funcionário: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Desconhecido'}` },
            { status: 500 }
        );
    }
}
