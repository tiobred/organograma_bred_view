"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
    Node,
    Edge,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    NodeTypes,
    BackgroundVariant,
    Panel,
    useReactFlow,
    Connection,
    EdgeMouseHandler,
    OnEdgesDelete,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { EmployeeNode, type EmployeeNodeData } from "@/components/org-chart/EmployeeNode";
import { OrgChartControls } from "./OrgChartControls";

import { RemoveConnectionDialog } from "./RemoveConnectionDialog";
import { ViewProfileDialog } from "@/components/dialogs/ViewProfileDialog";
import { Database } from "@/types/supabase";
import ELK from "elkjs/lib/elk.bundled.js";
import { Loader2 } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
    departments?: {
        id: string;
        name: string;
        color: string;
    } | null;
};

const elk = new ELK();

//Node types configuration
const nodeTypes: NodeTypes = {
    employee: EmployeeNode,
};

// ELK layout options for hierarchical org chart
const elkOptions = {
    "elk.algorithm": "layered",
    "elk.layered.spacing.nodeNodeBetweenLayers": "100",
    "elk.spacing.nodeNode": "80",
    "elk.direction": "DOWN",
};

interface OrgChartCanvasProps {
    profiles: Profile[];
    onNodeClick?: (profile: Profile) => void;
    loading?: boolean;
}

export function OrgChartCanvas({
    profiles,
    onNodeClick,
    loading = false,
}: OrgChartCanvasProps) {
    const router = useRouter();
    const reactFlowInstance = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLayouting, setIsLayouting] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [connectionMode, setConnectionMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [removeDialog, setRemoveDialog] = useState<{
        isOpen: boolean;
        employeeName: string;
        managerName: string;
        employeeId: string;
    }>({
        isOpen: false,
        employeeName: "",
        managerName: "",
        employeeId: "",
    });

    const [viewProfile, setViewProfile] = useState<{
        isOpen: boolean;
        profile: Profile | null;
    }>({
        isOpen: false,
        profile: null,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    // Get unique departments
    const departments = Array.from(
        new Set(profiles.map((p) => p.departments?.name).filter(Boolean))
    ) as string[];

    // Get unique tags
    const allTags = React.useMemo(() => {
        const tags = new Set<string>();
        profiles.forEach(p => {
            p.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [profiles]);

    // Filter profiles by department and tags - use useMemo to prevent recalculation
    const filteredProfiles = React.useMemo(() => {
        return profiles.filter((p) => {
            // Department filter
            if (selectedDepartment && p.departments?.name !== selectedDepartment) {
                return false;
            }

            // Tag filter (OR logic - if any selected tag matches)
            if (selectedTags.length > 0) {
                const hasTag = p.tags?.some(tag => selectedTags.includes(tag));
                if (!hasTag) return false;
            }

            return true;
        });
    }, [profiles, selectedDepartment, selectedTags]);

    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const [initialized, setInitialized] = useState(false);

    // Initialize collapsed state - collapse all parents by default
    useEffect(() => {
        if (!initialized && profiles.length > 0) {
            const parents = new Set(profiles.map(p => p.manager_id).filter(Boolean));
            const initialCollapsed = new Set<string>();
            parents.forEach(id => {
                if (id) initialCollapsed.add(id);
            });
            // Also add anyone who is a manager (has subordinates)
            profiles.forEach(p => {
                const hasSubordinates = profiles.some(sub => sub.manager_id === p.id);
                if (hasSubordinates) {
                    initialCollapsed.add(p.id);
                }
            });

            setCollapsedNodes(initialCollapsed);
            setInitialized(true);
        }
    }, [profiles, initialized]);

    const handleNodeToggle = useCallback((nodeId: string) => {
        setCollapsedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    // Helper to get descendants of a node
    const getDescendants = useCallback((parentId: string, allProfiles: Profile[]): Set<string> => {
        const descendants = new Set<string>();
        const queue = [parentId];
        while (queue.length > 0) {
            const current = queue.shift()!;
            const children = allProfiles.filter(p => p.manager_id === current);
            children.forEach(child => {
                descendants.add(child.id);
                queue.push(child.id);
            });
        }
        return descendants;
    }, []);


    const handleViewProfile = useCallback((profile: Profile) => {
        console.log("Opening view profile for", profile.full_name);
        setViewProfile({ isOpen: true, profile });
    }, []);

    // Filter profiles based on collapsed state
    const getVisibleProfiles = useCallback((profilesToFilter: Profile[], collapsed: Set<string>) => {
        // Start with all profiles
        let visible = new Set(profilesToFilter.map(p => p.id));

        // For each collapsed node, remove its descendants
        collapsed.forEach(collapsedId => {
            // Check if the collapsed node itself is visible (might be hidden by a parent)
            if (!visible.has(collapsedId)) return;

            const descendants = getDescendants(collapsedId, profilesToFilter);
            descendants.forEach(id => visible.delete(id));
        });

        return profilesToFilter.filter(p => visible.has(p.id));
    }, [getDescendants]);

    // Build hierarchical layout using ELK
    const getLayoutedElements = useCallback(
        async (profilesToLayout: Profile[], collapsedState: Set<string>) => {
            setIsLayouting(true);

            // Filter profiles based on collapsed state
            const visibleProfiles = getVisibleProfiles(profilesToLayout, collapsedState);

            // Create nodes
            const initialNodes: Node<EmployeeNodeData>[] = visibleProfiles.map(
                (profile) => {
                    const hasSubordinates = profilesToLayout.some(p => p.manager_id === profile.id);
                    return {
                        id: profile.id,
                        type: "employee",
                        position: { x: 0, y: 0 },
                        data: {
                            profile,
                            onNodeClick,
                            collapsed: collapsedState.has(profile.id),
                            onToggle: hasSubordinates ? () => handleNodeToggle(profile.id) : undefined,
                            hasSubordinates,
                            onViewProfile: handleViewProfile
                        },
                        // Always connectable - onConnect callback validates connectionMode
                        connectable: true,
                    };
                }
            );
            // Create edges (connections between manager and employees)
            const initialEdges: Edge[] = visibleProfiles
                .filter((p) => p.manager_id && visibleProfiles.some(m => m.id === p.manager_id)) // Ensure both ends are visible
                .map((profile) => {
                    const isAdvisor = profile.is_advisor;
                    return {
                        id: `${profile.manager_id}-${profile.id}`,
                        source: profile.manager_id!,
                        target: profile.id,
                        type: "smoothstep",
                        animated: false,
                        style: {
                            stroke: isAdvisor ? "#9333ea" : "#6366f1", // Purple for advisor, default for normal
                            strokeWidth: 2,
                            strokeDasharray: isAdvisor ? "5,5" : undefined, // Dashed for advisor
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: isAdvisor ? "#9333ea" : "#6366f1", // Match marker color to stroke
                        },
                    };
                });

            // CRITICAL FIX: Filter edges to only include those with valid source and target nodes
            // This prevents ELK graph JSON import error: "Referenced shape does not exist"
            const validEdges = initialEdges.filter((edge) => {
                const sourceExists = initialNodes.some((n) => n.id === edge.source);
                const targetExists = initialNodes.some((n) => n.id === edge.target);
                if (!sourceExists || !targetExists) {
                    console.warn(
                        `Skipping invalid edge: ${edge.id} - source exists: ${sourceExists}, target exists: ${targetExists}`
                    );
                }
                return sourceExists && targetExists;
            });

            // If no nodes, clear state
            if (initialNodes.length === 0) {
                setNodes([]);
                setEdges([]);
                setIsLayouting(false);
                return;
            }

            // Prepare graph for ELK with validated edges
            const graph = {
                id: "root",
                layoutOptions: elkOptions,
                children: initialNodes.map((node) => ({
                    id: node.id,
                    width: 300,
                    height: 100,
                })),
                edges: validEdges.map((edge) => ({
                    id: edge.id,
                    sources: [edge.source],
                    targets: [edge.target],
                })),
            };

            try {
                const layoutedGraph = await elk.layout(graph);

                const layoutedNodes = initialNodes.map((node) => {
                    const layoutedNode = layoutedGraph.children?.find(
                        (n) => n.id === node.id
                    );
                    return {
                        ...node,
                        position: {
                            x: layoutedNode?.x ?? 0,
                            y: layoutedNode?.y ?? 0,
                        },
                    };
                });

                setNodes(layoutedNodes);
                setEdges(
                    validEdges.map((edge) => ({
                        ...edge,
                        deletable: true,
                    }))
                );
            } catch (error) {
                console.error("Layout error:", error);
                setNodes(initialNodes);
                setEdges(validEdges);
            } finally {
                setIsLayouting(false);
            }
        },
        [onNodeClick, setNodes, setEdges, handleNodeToggle, getVisibleProfiles, handleViewProfile]
    );

    // Update layout when filtered profiles change
    useEffect(() => {
        if (filteredProfiles.length > 0) {
            getLayoutedElements(filteredProfiles, collapsedNodes);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [filteredProfiles, collapsedNodes, initialized, getLayoutedElements]);

    // Handle connection creation
    const onConnect = useCallback(
        async (connection: Connection) => {
            // Only allow connections in connection mode
            if (!connectionMode) {
                console.log("Connection mode not active");
                return;
            }

            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);

            if (!sourceNode || !targetNode) {
                console.error("Source or target node not found");
                return;
            }

            const sourceProfile = sourceNode.data.profile as Profile;
            const targetProfile = targetNode.data.profile as Profile;

            const confirm = window.confirm(
                `Deseja definir ${sourceProfile.full_name} como gestor(a) de ${targetProfile.full_name}?`
            );

            if (!confirm) return;

            try {
                const response = await fetch(
                    `/api/employees/${targetNode.id}/manager`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ manager_id: sourceNode.id }),
                    }
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Failed to update manager");
                }

                // Success - refresh to show new connection
                router.refresh();
            } catch (error) {
                console.error("Connection error:", error);
                alert(`Erro ao criar conexão: ${error instanceof Error ? error.message : "Tente novamente."}`);
            }
        },
        [connectionMode, nodes, router]
    );

    // Handle edge deletion
    const onEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
        event.stopPropagation();

        const employeeId = edge.target;
        const managerId = edge.source;

        const employee = profiles.find((p) => p.id === employeeId);
        const manager = profiles.find((p) => p.id === managerId);

        if (!employee || !manager) return;

        setRemoveDialog({
            isOpen: true,
            employeeName: employee.full_name,
            managerName: manager.full_name,
            employeeId: employee.id,
        });
    }, [profiles]);

    // Zoom controls
    const handleZoomIn = () => reactFlowInstance.zoomIn();
    const handleZoomOut = () => reactFlowInstance.zoomOut();
    const handleFitView = () => reactFlowInstance.fitView({ padding: 0.2 });

    // Auto-layout
    const handleAutoLayout = () => {
        getLayoutedElements(filteredProfiles, collapsedNodes);
        setTimeout(() => handleFitView(), 100);
    };

    // Fullscreen
    const handleFullscreenToggle = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (loading || isLayouting) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-gray-600 font-medium">
                        {loading ? "Carregando organograma..." : "Organizando estrutura..."}
                    </p>
                </div>
            </div>
        );
    }

    if (profiles.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center space-y-2">
                    <p className="text-gray-600 text-lg">
                        Nenhum perfil encontrado
                    </p>
                    <p className="text-gray-500 text-sm">
                        Adicione funcionários para visualizar o organograma
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="h-full w-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={1.5}
                nodesDraggable={true} // Allow dragging nodes
                panOnDrag={[1, 2]} // Only pan with middle or right mouse button (not left)
                elementsSelectable={true}
                selectNodesOnDrag={false}
                className="bg-gradient-to-br from-blue-50/30 to-purple-50/30"
            >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} />

                <MiniMap
                    nodeColor={(node) => {
                        const profile = (node.data as any).profile as Profile;
                        return profile.departments?.name === "Tecnologia"
                            ? "#6366f1"
                            : profile.departments?.name === "Operações"
                                ? "#10b981"
                                : "#f59e0b";
                    }}
                    className="!bg-white !border !border-gray-200 !rounded-lg !shadow-lg"
                    maskColor="rgb(240, 240, 240, 0.6)"
                />

                <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-3 m-4">
                    <div className="text-sm font-medium text-gray-700">
                        {filteredProfiles.length} {filteredProfiles.length === 1 ? "pessoa" : "pessoas"}
                        {selectedDepartment && ` em ${selectedDepartment}`}
                    </div>
                </Panel>

                <OrgChartControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitView={handleFitView}
                    onAutoLayout={handleAutoLayout}
                    onDepartmentChange={setSelectedDepartment}
                    onConnectionModeToggle={() => setConnectionMode(!connectionMode)}
                    departments={departments}
                    selectedDepartment={selectedDepartment}
                    tags={allTags}
                    selectedTags={selectedTags}
                    onTagChange={setSelectedTags}
                    connectionMode={connectionMode}
                    isFullscreen={isFullscreen}
                    onFullscreenToggle={handleFullscreenToggle}
                />
            </ReactFlow>

            <RemoveConnectionDialog
                isOpen={removeDialog.isOpen}
                onClose={() =>
                    setRemoveDialog({ ...removeDialog, isOpen: false })
                }
                employeeName={removeDialog.employeeName}
                managerName={removeDialog.managerName}
                employeeId={removeDialog.employeeId}
            />

            <ViewProfileDialog
                isOpen={viewProfile.isOpen}
                onClose={() => setViewProfile({ ...viewProfile, isOpen: false })}
                profile={viewProfile.profile}
            />
        </div>
    );
}
