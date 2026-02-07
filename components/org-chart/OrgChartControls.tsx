"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Filter,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    Link as LinkIcon
} from "lucide-react";

interface OrgChartControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onAutoLayout: () => void;
    onDepartmentChange: (department: string) => void;
    onConnectionModeToggle: () => void;
    departments: string[];
    selectedDepartment: string;
    connectionMode: boolean;
    isFullscreen: boolean;
    onFullscreenToggle: () => void;
}

export function OrgChartControls({
    onZoomIn,
    onZoomOut,
    onFitView,
    onAutoLayout,
    onDepartmentChange,
    onConnectionModeToggle,
    departments,
    selectedDepartment,
    connectionMode,
    isFullscreen,
    onFullscreenToggle
}: OrgChartControlsProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {/* Main Controls */}
            <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2">
                {/* Zoom Controls */}
                <button
                    onClick={onZoomIn}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
                <button
                    onClick={onZoomOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                </button>

                <div className="h-px bg-gray-200" />

                {/* Auto Layout */}
                <button
                    onClick={onAutoLayout}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Re-organizar"
                >
                    <LayoutDashboard className="w-5 h-5 text-gray-700" />
                </button>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg transition-colors ${showFilters ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-700"
                        }`}
                    title="Filtros"
                >
                    <Filter className="w-5 h-5" />
                </button>

                {/* Connection Mode */}
                <button
                    onClick={onConnectionModeToggle}
                    className={`p-2 rounded-lg transition-colors ${connectionMode ? "bg-purple-100 text-purple-600" : "hover:bg-gray-100 text-gray-700"
                        }`}
                    title="Modo Conexão"
                >
                    <LinkIcon className="w-5 h-5" />
                </button>

                <div className="h-px bg-gray-200" />

                {/* Fullscreen */}
                <button
                    onClick={onFullscreenToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}
                >
                    {isFullscreen ? (
                        <Minimize className="w-5 h-5 text-gray-700" />
                    ) : (
                        <Maximize className="w-5 h-5 text-gray-700" />
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-lg p-4 w-64">
                    <h3 className="font-semibold text-gray-900 mb-3">Filtrar por Departamento</h3>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos os Departamentos</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>

                    {selectedDepartment && (
                        <button
                            onClick={() => onDepartmentChange("")}
                            className="mt-2 w-full text-sm text-blue-600 hover:text-blue-700"
                        >
                            Limpar Filtro
                        </button>
                    )}
                </div>
            )}

            {/* Connection Mode Hint */}
            {connectionMode && (
                <div className="bg-purple-100 border border-purple-300 rounded-xl shadow-lg p-3 w-64">
                    <p className="text-sm text-purple-900 font-medium">
                        🔗 Modo Conexão Ativo
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                        Arraste de um funcionário para outro para criar uma conexão de gestão.
                    </p>
                </div>
            )}
        </div>
    );
}
