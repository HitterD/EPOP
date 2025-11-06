'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { triggerNodes, conditionNodes, actionNodes, NodeDefinition } from '../types/workflow'
import { nanoid } from 'nanoid'

interface NodePaletteProps {
  onAddNode: (nodeType: string, type: 'trigger' | 'condition' | 'action', label: string, icon: string) => void
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const handleAddNode = (def: NodeDefinition) => {
    onAddNode(def.nodeType, def.type, def.label, def.icon)
  }

  const NodeButton = ({ definition }: { definition: NodeDefinition }) => (
    <Button
      variant="outline"
      className="h-auto w-full justify-start gap-2 p-3 text-left"
      onClick={() => handleAddNode(definition)}
    >
      <span className="text-xl">{definition.icon}</span>
      <div className="flex-1">
        <div className="text-sm font-semibold">{definition.label}</div>
        <div className="text-xs text-muted-foreground">{definition.description}</div>
      </div>
    </Button>
  )

  return (
    <Card className="h-full w-64 flex-shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Node Palette</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {/* Triggers */}
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">TRIGGERS</div>
              <div className="space-y-2">
                {triggerNodes.map((node) => (
                  <NodeButton key={node.nodeType} definition={node} />
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">CONDITIONS</div>
              <div className="space-y-2">
                {conditionNodes.map((node) => (
                  <NodeButton key={node.nodeType} definition={node} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">ACTIONS</div>
              <div className="space-y-2">
                {actionNodes.map((node) => (
                  <NodeButton key={node.nodeType} definition={node} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
