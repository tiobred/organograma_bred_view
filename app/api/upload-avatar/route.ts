import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Get user's profile to check role
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("metadata")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: "Perfil não encontrado" },
                { status: 404 }
            );
        }

        // @ts-ignore
        const role = profile.metadata?.role;
        if (role !== "admin" && role !== "editor") {
            return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
        }

        // Get form data
        const formData = await request.formData();
        const fullImage = formData.get("fullImage") as File;
        const thumbnail = formData.get("thumbnail") as File;
        const profileId = formData.get("profileId") as string;

        if (!fullImage || !thumbnail || !profileId) {
            return NextResponse.json(
                { error: "Dados inválidos" },
                { status: 400 }
            );
        }

        // Validate file sizes (server-side check)
        if (fullImage.size > 2 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Imagem muito grande (máximo 2MB)" },
                { status: 400 }
            );
        }

        // Generate unique filenames
        const fileId = uuidv4();
        const fullImagePath = `profiles/${profileId}/${fileId}-full.webp`;
        const thumbnailPath = `profiles/${profileId}/${fileId}-thumb.webp`;

        // Upload full image
        const { data: fullImageData, error: fullImageError } = await supabase
            .storage
            .from("avatars")
            .upload(fullImagePath, fullImage, {
                contentType: "image/webp",
                upsert: true,
            });

        if (fullImageError) {
            return NextResponse.json(
                { error: "Erro ao fazer upload da imagem" },
                { status: 500 }
            );
        }

        // Upload thumbnail
        const { data: thumbnailData, error: thumbnailError } = await supabase
            .storage
            .from("avatars")
            .upload(thumbnailPath, thumbnail, {
                contentType: "image/webp",
                upsert: true,
            });

        if (thumbnailError) {
            // Rollback full image upload
            await supabase.storage.from("avatars").remove([fullImagePath]);
            return NextResponse.json(
                { error: "Erro ao fazer upload da miniatura" },
                { status: 500 }
            );
        }

        // Get public URLs
        const { data: fullImageUrl } = supabase.storage
            .from("avatars")
            .getPublicUrl(fullImagePath);

        const { data: thumbnailUrl } = supabase.storage
            .from("avatars")
            .getPublicUrl(thumbnailPath);

        // Update profile with new avatar URLs
        const { error: updateError } = await supabase
            .from("profiles")
            // @ts-ignore
            .update({
                avatar_url: fullImageUrl.publicUrl,
                avatar_thumbnail_url: thumbnailUrl.publicUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profileId);

        if (updateError) {
            // Rollback uploads
            await supabase.storage.from("avatars").remove([fullImagePath, thumbnailPath]);
            return NextResponse.json(
                { error: "Erro ao atualizar perfil" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            avatar_url: fullImageUrl.publicUrl,
            avatar_thumbnail_url: thumbnailUrl.publicUrl,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
