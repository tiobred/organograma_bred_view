"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { AvatarPreview } from "@/components/avatar/AvatarPreview";
import { EmployeeContextMenu } from "@/components/org-chart/EmployeeContextMenu";
import { ChangeManagerDialog } from "@/components/org-chart/ChangeManagerDialog";
import { Database } from "@/types/supabase";
import { Users, Mail, Sparkles } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface EmployeeNodeData {
    profile: Profile;
    onNodeClick?: (profile: Profile) => void;
    collapsed?: boolean;
    onToggle?: () => void;
    hasSubordinates?: boolean;
}

function EmployeeNodeComponent({ data }: NodeProps<EmployeeNodeData>) {
    const { profile, onNodeClick } = data;
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showChangeManager, setShowChangeManager] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    // Get department name and color from joined data
    // @ts-ignore
    const departmentName = profile.departments?.name || "Sem Departamento";
    // @ts-ignore
    const departmentColor = profile.departments?.color || "#6b7280"; // Default gray

    // Generate gradient based on department color
    const gradientStyle = {
        background: `linear-gradient(135deg, ${departmentColor}15 0%, ${departmentColor}05 100%)`,
        borderColor: departmentColor,
    };

    // Handle context menu (right-click)
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    return (
        <>
            <div
                onClick={() => onNodeClick?.(profile)}
                onContextMenu={handleContextMenu}
                className="group relative w-[300px] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                    ...gradientStyle,
                }}
            >
                {/* Top handle for parent connection */}
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!bg-gradient-to-r !from-blue-500 !to-purple-500 !border-2 !border-white !w-3 !h-3 !shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                />

                {/* Main Card with Glassmorphism */}
                <div className="relative backdrop-blur-xl bg-white/90 border-2 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300" style={{ borderColor: `${departmentColor}80` }}>
                    {/* Top Gradient Band */}
                    <div
                        className="h-2"
                        style={{ backgroundColor: departmentColor }}
                    />
                    {/* Sparkle effect on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                    </div>

                    <div className="flex items-start gap-4">
                        {/* Avatar with gradient ring */}
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 rounded-full opacity-20 blur-md group-hover:opacity-40 transition-opacity" style={{ backgroundColor: departmentColor }} />
                            <AvatarPreview
                                url={profile.avatar_thumbnail_url || profile.avatar_url}
                                name={profile.full_name}
                                size={64}
                                className="ring-4 ring-white group-hover:ring-blue-100 transition-all relative z-10"
                            />
                            {/* Status indicator with pulse animation */}
                            <div className="absolute bottom-0 right-0 z-20">
                                <div className="relative">
                                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 min-w-0 space-y-1">
                            {/* Name */}
                            <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
                                {profile.full_name}
                            </h3>

                            {/* Position */}
                            <p className="text-sm font-medium text-gray-700 truncate">
                                {profile.position}
                            </p>

                            {/* Department Badge */}
                            {(profile as any).departments?.name && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${departmentColor}20`, color: departmentColor }}>
                                        {departmentName}
                                    </span>
                                </div>
                            )}

                            {/* Email (on hover) */}
                            {profile.email && (
                                <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 truncate">
                                        {profile.email}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Animated gradient overlay on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity -z-10" />
                </div>

                {/* Bottom handle for children connection */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!bg-gradient-to-r !from-blue-500 !to-purple-500 !border-2 !border-white !w-3 !h-3 !shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                />

                {/* Collapse/Expand Button */}
                {data.hasSubordinates && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onToggle?.();
                        }}
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 transition-colors z-50 text-blue-600 font-bold text-xs leading-none"
                    >
                        {data.collapsed ? "+" : "-"}
                    </button>
                )}
            </div>

            {/* Context Menu */}
            {showContextMenu && (
                <EmployeeContextMenu
                    employeeId={profile.id}
                    employeeName={profile.full_name}
                    position={menuPosition}
                    onClose={() => setShowContextMenu(false)}
                    onChangeManager={() => {
                        setShowContextMenu(false);
                        setShowChangeManager(true);
                    }}
                />
            )}

            {/* Change Manager Dialog */}
            <ChangeManagerDialog
                isOpen={showChangeManager}
                onClose={() => setShowChangeManager(false)}
                employeeId={profile.id}
                employeeName={profile.full_name}
                currentManagerId={profile.manager_id}
            />
        </>
    );
}

export const EmployeeNode = memo(EmployeeNodeComponent);
