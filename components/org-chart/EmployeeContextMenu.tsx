"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Link2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface EmployeeContextMenuProps {
    employeeId: string;
    employeeName: string;
    position: { x: number; y: number };
    onClose: () => void;
    onChangeManager: () => void;
}

export function EmployeeContextMenu({
    employeeId,
    employeeName,
    position,
    onClose,
    onChangeManager,
}: EmployeeContextMenuProps) {
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    const handleEdit = () => {
        // router.push(`/admin/employees/${employeeId}`); // Replaced by Link
        onClose();
    };

    const handleDelete = () => {
        if (confirm(`Tem certeza que deseja excluir ${employeeName}?`)) {
            // TODO: Implement delete
            console.log("Delete:", employeeId);
        }
        onClose();
    };

    const handleChangeManager = () => {
        onChangeManager();
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[9999]" onClick={onClose} />

            {/* Menu */}
            <div
                ref={menuRef}
                className="fixed z-[10000] bg-white rounded-lg shadow-2xl border border-gray-200 min-w-[200px] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            >
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">
                            {employeeName}
                        </p>
                        <p className="text-xs text-gray-500">Ações</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                    <Link
                        href={`/admin/employees/${employeeId}`}
                        onClick={() => onClose()}
                        className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 text-sm"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">Editar Funcionário</span>
                    </Link>

                    <button
                        onClick={handleChangeManager}
                        className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 text-sm"
                    >
                        <Link2 className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">Alterar Gestor</span>
                    </button>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-sm"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">Excluir</span>
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}
