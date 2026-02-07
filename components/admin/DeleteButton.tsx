"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
    employeeId: string;
    employeeName: string;
}

export function DeleteButton({ employeeId, employeeName }: DeleteButtonProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/employees/${employeeId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erro ao excluir funcionário");
            }

            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Erro ao excluir funcionário. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {/* Confirmation Dialog */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Confirmar Exclusão
                            </h3>
                            <p className="text-gray-600">
                                Tem certeza que deseja excluir{" "}
                                <span className="font-semibold text-gray-900">{employeeName}</span>?
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
