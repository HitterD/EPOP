'use client'

import { useState, useRef } from 'react'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { WorkflowNode } from './workflow-node'
import { WorkflowNode as WorkflowNodeType } from '../types/workflow'
import { nanoid } from 'nanoid'

interface WorkflowCanvasProps {
  nodes: WorkflowNodeType[]
  onNodesChange: (nodes: WorkflowNodeType[]) => void
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
}

export function WorkflowCanvas({ nodes, onNodesChange, selectedNodeId, onSelectNode }: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const nodeId = active.id as string

    // Update node position
    onNodesChange(
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              position: {
                x: node.position.x + delta.x,
                y: node.position.y + delta.y,
              },
            }
          : node
      )
    )
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Deselect node when clicking canvas background
    if (e.target === canvasRef.current) {
      onSelectNode(null)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        ref={canvasRef}
        className="relative h-full w-full overflow-auto bg-grid-pattern"
        onClick={handleCanvasClick}
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {/* Canvas content area */}
        <div className="relative min-h-[800px] min-w-[1200px]">
          {nodes.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-6xl opacity-20">📦</div>
              <p className="mt-4 text-sm text-muted-foreground">
                Add nodes from the palette to build your workflow
              </p>
            </div>
          )}

          {/* Render nodes */}
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              onSelect={onSelectNode}
              isSelected={selectedNodeId === node.id}
            />
          ))}

          {/* TODO: Render edges/connections between nodes */}
        </div>
      </div>
    </DndContext>
  )
}
