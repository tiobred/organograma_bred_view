import { AvatarPreview } from "@/components/avatar/AvatarPreview";
import { Database } from "@/types/supabase";
import { Calendar, Briefcase, Mail, Building2, User, X } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ViewProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile | null;
}

export function ViewProfileDialog({ isOpen, onClose, profile }: ViewProfileDialogProps) {
    if (!isOpen || !profile) return null;

    // @ts-ignore
    const departmentName = profile.departments?.name || "Sem Departamento";
    // @ts-ignore
    const departmentColor = profile.departments?.color || "#6b7280";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10010] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Detalhes do Colaborador</h2>
                        <p className="text-gray-500 text-sm mt-1">Visão completa do perfil e atribuições</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 bg-gray-50/50">
                    <div className="flex flex-col gap-8">
                        {/* Hero Section */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <AvatarPreview
                                url={profile.avatar_thumbnail_url || profile.avatar_url}
                                name={profile.full_name}
                                size={140}
                                className="border-4 border-white shadow-xl flex-shrink-0"
                            />
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h3>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            {profile.position}
                                        </span>
                                        <span
                                            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border border-transparent"
                                            style={{
                                                backgroundColor: `${departmentColor}15`,
                                                color: departmentColor,
                                                borderColor: `${departmentColor}30`
                                            }}
                                        >
                                            <Building2 className="w-4 h-4 mr-2" />
                                            {departmentName}
                                        </span>
                                        {profile.is_advisor && (
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                                                <User className="w-4 h-4 mr-2" />
                                                Assessor
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-6 justify-center md:justify-start text-gray-600 pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            <Mail className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="font-medium">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            <Calendar className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span>Início em <span className="font-medium text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Bio Column */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-500" />
                                        Sobre
                                    </h4>
                                    <div className="prose prose-sm text-gray-600">
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                            {profile.bio || "Nenhuma biografia cadastrada para este colaborador."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Responsibilities Column */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-purple-500" />
                                        Papéis e Responsabilidades
                                    </h4>
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        {profile.responsibilities ? (
                                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                                                {profile.responsibilities}
                                            </p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                                                <Briefcase className="w-12 h-12 mb-3 opacity-20" />
                                                <p>Nenhuma responsabilidade cadastrada.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
