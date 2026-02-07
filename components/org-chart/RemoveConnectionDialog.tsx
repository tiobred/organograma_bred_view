"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";

interface RemoveConnectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    employeeName: string;
    managerName: string;
    employeeId: string;
}

export function RemoveConnectionDialog({
    isOpen,
    onClose,
    employeeName,
    managerName,
    employeeId
}: RemoveConnectionDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRemove = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/employees/${employeeId}/manager`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ manager_id: null }),
            });

            if (!response.ok) {
                throw new Error("Erro ao remover conexão");
            }

            onClose();
            router.refresh();
        } catch (error) {
            console.error("Remove error:", error);
            alert("Erro ao remover conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Remover Conexão
                    </h3>
                    <p className="text-gray-600">
                        Tem certeza que deseja remover a conexão entre{" "}
                        <span className="font-semibold text-gray-900">{employeeName}</span>
                        {" "}e{" "}
                        <span className="font-semibold text-gray-900">{managerName}</span>?
                    </p>
                    <p className="text-sm text-orange-600 mt-2">
                        {employeeName} ficará sem gestor direto.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleRemove}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Removendo..." : "Remover"}
                    </button>
                </div>
            </div>
        </div>
    );
}
