export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            departments: {
                Row: {
                    color: string
                    created_at: string
                    description: string | null
                    id: string
                    manager_id: string | null
                    name: string
                }
                Insert: {
                    color?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    manager_id?: string | null
                    name: string
                }
                Update: {
                    color?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    manager_id?: string | null
                    name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "departments_manager_id_fkey"
                        columns: ["manager_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    avatar_thumbnail_url: string | null
                    avatar_url: string | null
                    bio: string | null
                    created_at: string
                    department_id: string | null
                    email: string
                    full_name: string
                    id: string
                    manager_id: string | null
                    metadata: Json | null
                    position: string
                    updated_at: string | null
                    is_advisor: boolean
                    responsibilities: string | null
                }
                Insert: {
                    avatar_thumbnail_url?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    department_id?: string | null
                    email: string
                    full_name: string
                    id: string
                    manager_id?: string | null
                    metadata?: Json | null
                    position: string
                    updated_at?: string | null
                    is_advisor?: boolean
                }
                Update: {
                    avatar_thumbnail_url?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    department_id?: string | null
                    email?: string
                    full_name?: string
                    id?: string
                    manager_id?: string | null
                    metadata?: Json | null
                    position?: string
                    updated_at?: string | null
                    is_advisor?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profiles_manager_id_fkey"
                        columns: ["manager_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
