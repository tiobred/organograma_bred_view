"use client";

import { ReactFlowProvider } from "reactflow";
import { OrgChartCanvas as OrgChartCanvasInner } from "./OrgChartCanvas";
import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface OrgChartWrapperProps {
    profiles: Profile[];
    onNodeClick?: (profile: Profile) => void;
    loading?: boolean;
}

export function OrgChartCanvas(props: OrgChartWrapperProps) {
    return (
        <ReactFlowProvider>
            <OrgChartCanvasInner {...props} />
        </ReactFlowProvider>
    );
}
