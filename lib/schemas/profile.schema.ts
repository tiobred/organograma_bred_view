import { z } from "zod";

// Profile validation schema
export const profileSchema = z.object({
    email: z.string().email("Email inválido"),
    full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    position: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
    department: z.string().optional(),
    manager_id: z.string().uuid().optional().nullable(),
    bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
    phone: z.string().optional(),
    start_date: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Avatar upload validation
export const avatarUploadSchema = z.object({
    file: z.instanceof(File, { message: "Arquivo inválido" })
        .refine((file) => file.size <= 2 * 1024 * 1024, {
            message: "Arquivo deve ter no máximo 2MB",
        })
        .refine(
            (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
            {
                message: "Formato deve ser JPEG, PNG ou WebP",
            }
        ),
});

export type AvatarUpload = z.infer<typeof avatarUploadSchema>;
