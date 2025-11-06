'use client'

import { useCallback, useMemo, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { OrgUnit, User } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMoveOrgUnit, useMoveUserToUnit, useUpdateOrgUnit } from '@/lib/api/hooks/use-directory'

function DraggableUnit({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `unit:${id}` })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

function DroppableUnit({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: `unit:${id}` })
  return (
    <div ref={setNodeRef}>{children}</div>
  )
}

function DraggableUser({ user }: { user: User }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `user:${user.id}` })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center justify-between rounded border bg-background/50 p-2"
    >
      <span className="text-xs">{user.name}</span>
      <Badge variant="outline" className="text-[10px]">{user.email}</Badge>
    </div>
  )
}

function UnitNode({ unit }: { unit: OrgUnit }) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [name, setName] = useState(unit.name)
  const updateUnit = useUpdateOrgUnit()
  const memberCount = useMemo(() => unit.members?.length || 0, [unit.members])

  const submitRename = () => {
    if (name.trim() && name.trim() !== unit.name) {
      updateUnit.mutate({ unitId: unit.id, patch: { name: name.trim() } })
    }
    setIsRenaming(false)
  }

  return (
    <DroppableUnit id={unit.id}>
      <DraggableUnit id={unit.id}>
        <Card className="mb-2">
          <CardContent className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              {isRenaming ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 w-56"
                  />
                  <Button size="sm" onClick={submitRename}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setIsRenaming(false); setName(unit.name) }}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-medium">{unit.name}</span>
                  <Badge variant="outline">{memberCount} members</Badge>
                </div>
              )}
              {!isRenaming && (
                <Button variant="ghost" size="sm" onClick={() => setIsRenaming(true)}>Rename</Button>
              )}
            </div>

            {unit.members && unit.members.length > 0 && (
              <div className="ml-2 space-y-1">
                {unit.members.map((u) => (
                  <DraggableUser key={u.id} user={u} />
                ))}
              </div>
            )}

            {unit.children && unit.children.length > 0 && (
              <div className="ml-4 space-y-2 border-l pl-4">
                {unit.children.map((child) => (
                  <UnitNode key={child.id} unit={child} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DraggableUnit>
    </DroppableUnit>
  )
}

export function OrgTree({ root }: { root: OrgUnit }) {
  const moveOrgUnit = useMoveOrgUnit()
  const moveUser = useMoveUserToUnit()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!active?.id || !over?.id) return
      const activeId = String(active.id)
      const overId = String(over.id)
      if (activeId === overId) return

      if (activeId.startsWith('user:') && overId.startsWith('unit:')) {
        const userId = activeId.substring('user:'.length)
        const toUnitId = overId.substring('unit:'.length)
        moveUser.mutate({ userId, toUnitId })
        return
      }

      if (activeId.startsWith('unit:') && overId.startsWith('unit:')) {
        const unitId = activeId.substring('unit:'.length)
        const toParentId = overId.substring('unit:'.length)
        if (unitId === toParentId) return
        moveOrgUnit.mutate({ unitId, toParentId })
      }
    },
    [moveOrgUnit, moveUser]
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <UnitNode unit={root} />
    </DndContext>
  )
}
