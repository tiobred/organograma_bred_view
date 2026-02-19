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

            // VERTICAL LAYOUT CONFIG
            const VERTICAL_THRESHOLD = 5;
            const NODE_WIDTH = 300;
            const NODE_HEIGHT = 100;
            const VERTICAL_SPACING = 20;

            // 1. Identify "Large Teams" (Managers with > Threshold visible subordinates)
            const subordinatesByManager = new Map<string, Profile[]>();
            visibleProfiles.forEach(p => {
                if (p.manager_id && visibleProfiles.some(m => m.id === p.manager_id)) {
                    const subs = subordinatesByManager.get(p.manager_id) || [];
                    subs.push(p);
                    subordinatesByManager.set(p.manager_id, subs);
                }
            });

            const managersWithLargeTeams = new Set<string>();
            subordinatesByManager.forEach((subs, managerId) => {
                if (subs.length > VERTICAL_THRESHOLD) {
                    managersWithLargeTeams.add(managerId);
                }
            });

            // 2. Prepare ELK Graph Nodes
            // We need to map Profile ID -> ELK Node ID
            // For normal profiles: ELK ID = Profile ID
            // For vertical groups: We create a "Virtual Node" for the group

            const elkNodes: any[] = [];
            const profileIdToElkId = new Map<string, string>(); // Maps real profile ID to the node ID used in ELK (could be a virtual group)

            // Add all profiles to ELK, but group large teams
            const processedProfiles = new Set<string>();

            visibleProfiles.forEach(profile => {
                if (processedProfiles.has(profile.id)) return;

                const isInsideStack = profile.manager_id && managersWithLargeTeams.has(profile.manager_id);
                const isLargeManager = managersWithLargeTeams.has(profile.id);

                // Case 1: Subordinate inside a stack, NOT a large manager themselves
                // These are rendered purely visually inside the parent's stack.
                if (isInsideStack && !isLargeManager) {
                    return;
                }

                // Case 2: Add the Profile Node ITSELF to ELK
                // We only add the individual node to ELK if it's NOT inside a stack.
                // (If it IS inside a stack, it's position is calculated in finalNodes step relative to the stack)
                if (!isInsideStack) {
                    elkNodes.push({
                        id: profile.id,
                        width: NODE_WIDTH,
                        height: NODE_HEIGHT
                    });
                    processedProfiles.add(profile.id);
                    profileIdToElkId.set(profile.id, profile.id);
                }

                // Case 3: If it manages a large team, create the Virtual Node for its subordinates
                // This happens regardless of whether the manager is inside a stack or not.
                if (isLargeManager) {
                    const subordinates = subordinatesByManager.get(profile.id) || [];
                    const virtualNodeId = `group-${profile.id}`;

                    // Calculate height for the vertical stack
                    const stackHeight = (subordinates.length * (NODE_HEIGHT + VERTICAL_SPACING)) - VERTICAL_SPACING;

                    elkNodes.push({
                        id: virtualNodeId,
                        width: NODE_WIDTH, // Keep same width as a single node
                        height: stackHeight
                    });

                    // Subordinates will be processed (skipped) in subsequent iterations
                    // or picked up here if we want to be explicit, but the isInsideStack check handles them.
                }
            });

            // 3. Prepare ELK Edges
            const elkEdges: any[] = [];

            visibleProfiles.forEach(profile => {
                if (!profile.manager_id) return;

                // If manager is not visible, skip
                if (!visibleProfiles.some(m => m.id === profile.manager_id)) return;

                const managerId = profile.manager_id;

                // Determine Source and Target ELK IDs
                let sourceElkId = managerId;
                let targetElkId = profile.id;

                // If manager belongs to a large team (is a subordinate in a stack), 
                // we actually need the node ID to be the Manager's ID? 
                // Wait, if the manager IS part of a stack, their "node" is inside the virtual node.
                // But ELK only knows about the Virtual Node.
                // Complex case: Large Team Manager -> Large Team Manager.

                // SIMPLIFICATION:
                // For ELK, we connect:
                // Normal -> Normal
                // Normal -> Stack (Virtual Node)
                // Stack -> Normal (This is the tricky part, where does the edge start?)
                // Stack -> Stack

                // Check if Target is in a large team (i.e., is part of a stack)
                if (managersWithLargeTeams.has(managerId) && subordinatesByManager.get(managerId)?.some(s => s.id === profile.id)) {
                    // This edge is INTERNAL to the stack (Manager -> Subordinate in stack).
                    // We DO NOT let ELK handle this edge. We draw it manually or let ReactFlow draw it based on fixed positions.
                    return;
                }

                // Check if *Manager* (Source) is part of a stack
                // (i.e. Manager's Manager has a large team)
                const managersManagerId = visibleProfiles.find(p => p.id === managerId)?.manager_id;
                if (managersManagerId && managersWithLargeTeams.has(managersManagerId)) {
                    sourceElkId = `group-${managersManagerId}`;
                }

                // Check if *Profile* (Target) is a Manager of a large team (so target is the manager node itself, not a stack)
                // If the profile is just a normal node, ID is profile.id.
                // If profile is in a stack (handled above, we returned).

                // If Target is a Manager of a separate large team stack, the target is just the manager node (which is NOT the stack).
                // The stack is a sibling of the manager node in layout?
                // No, my logic above: Manager is one node, Subordinates are a SEPARATE Virtual Node.
                // So Edges are: Manager -> VirtualNode.

                // Re-evaluating logic:
                // IF I am the manager of a large team:
                // I have an edge to the Virtual Node representing my subordinates.
                if (managersWithLargeTeams.has(managerId) && !subordinatesByManager.get(managerId)?.some(s => s.id === profile.id)) {
                    // This is an edge from a Large Team Manager to someone NOT in their stack? 
                    // Unlikely in tree, but possible.
                }

                // Correct Logic for "Manager -> Stack":
                // We manually add ONE edge from Manager -> VirtualNode for the whole group.
            });

            // Add standard edges using our map, plus the special Manager->Stack edges

            // 3a. Standard Node -> Node edges (where neither is inside a stack)
            // ... strict ELK graph logic ...

            // Let's iterate constructed ELK Nodes to build edges
            // Use original profiles to determine connections

            // We need a map of ProfileID -> "IsInsideStack(StackID)"
            const profileStackMap = new Map<string, string>();
            managersWithLargeTeams.forEach(mgrId => {
                const subs = subordinatesByManager.get(mgrId) || [];
                const stackId = `group-${mgrId}`;
                subs.forEach(s => profileStackMap.set(s.id, stackId));
            });

            visibleProfiles.forEach(p => {
                if (!p.manager_id) return;
                const mgrId = p.manager_id;

                // Skip if manager invisible
                if (!visibleProfiles.some(m => m.id === mgrId)) return;

                const sourceStackId = profileStackMap.get(mgrId);
                const targetStackId = profileStackMap.get(p.id);

                const sourceId = sourceStackId || mgrId; // Use Stack ID if inside stack, else distinct ID
                const targetId = targetStackId || p.id;

                // Avoid self-loops (e.g. internal edges in stack)
                if (sourceId === targetId) return;

                // Add edge to ELK
                elkEdges.push({
                    id: `${sourceId}-${targetId}`, // Edge between layout blocks
                    sources: [sourceId],
                    targets: [targetId]
                });
            });

            // Also, for every Large Team Manager, we need an edge to their Subordinate Stack
            managersWithLargeTeams.forEach(mgrId => {
                // Check if Manager is inside another stack
                const sourceId = profileStackMap.get(mgrId) || mgrId;
                const targetId = `group-${mgrId}`; // The virtual node

                elkEdges.push({
                    id: `${sourceId}-${targetId}`,
                    sources: [sourceId],
                    targets: [targetId]
                });
            });

            // Deduplicate edges
            const uniqueElkEdges = Array.from(new Set(elkEdges.map(e => JSON.stringify(e)))).map(s => JSON.parse(s));

            const graph = {
                id: "root",
                layoutOptions: elkOptions,
                children: elkNodes,
                edges: uniqueElkEdges,
            };

            try {
                const layoutedGraph = await elk.layout(graph);

                // 4. Construct Final React Flow Nodes
                const finalNodes: Node<EmployeeNodeData>[] = [];

                // Helper to Create Node
                const createNode = (profile: Profile, x: number, y: number): Node<EmployeeNodeData> => {
                    const hasSubordinates = profilesToLayout.some(p => p.manager_id === profile.id);
                    return {
                        id: profile.id,
                        type: "employee",
                        position: { x, y },
                        data: {
                            profile,
                            onNodeClick,
                            collapsed: collapsedState.has(profile.id),
                            onToggle: hasSubordinates ? () => handleNodeToggle(profile.id) : undefined,
                            hasSubordinates,
                            onViewProfile: handleViewProfile
                        },
                        connectable: true,
                    };
                };

                // Apply ELK positions
                layoutedGraph.children?.forEach((elkNode) => {
                    if (elkNode.id.startsWith("group-")) {
                        // This is a Virtual Node (Stack)
                        // It contains the subordinates of the manager (manager_id = extract from group-ID)
                        const managerId = elkNode.id.replace("group-", "");
                        const subordinates = subordinatesByManager.get(managerId) || [];

                        // Stack them vertically inside this box
                        subordinates.forEach((sub, index) => {
                            // Calculate Absolute Position
                            const posX = elkNode.x ?? 0; // Same X as container
                            const posY = (elkNode.y ?? 0) + (index * (NODE_HEIGHT + VERTICAL_SPACING));

                            finalNodes.push(createNode(sub, posX, posY));
                        });
                    } else {
                        // Standard Node (Manager or independent)
                        const profile = visibleProfiles.find(p => p.id === elkNode.id);
                        if (profile) {
                            finalNodes.push(createNode(profile, elkNode.x ?? 0, elkNode.y ?? 0));
                        }
                    }
                });

                // 5. Construct Final Edges
                // Re-create all edges based on the final real node positions
                const finalEdges: Edge[] = visibleProfiles
                    .filter((p) => p.manager_id && visibleProfiles.some(m => m.id === p.manager_id))
                    .map((profile) => {
                        const isAdvisor = profile.is_advisor;
                        return {
                            id: `${profile.manager_id}-${profile.id}`,
                            source: profile.manager_id!,
                            target: profile.id,
                            type: "smoothstep", // React Flow handles the routing automatically!
                            animated: false,
                            style: {
                                stroke: isAdvisor ? "#9333ea" : "#6366f1",
                                strokeWidth: 2,
                                strokeDasharray: isAdvisor ? "5,5" : undefined,
                            },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: isAdvisor ? "#9333ea" : "#6366f1",
                            },
                        };
                    });

                setNodes(finalNodes);
                setEdges(
                    finalEdges.map((edge) => ({
                        ...edge,
                        deletable: true,
                    }))
                );
            } catch (error) {
                console.error("Layout error:", error);
                // Fallback? currently logging
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
