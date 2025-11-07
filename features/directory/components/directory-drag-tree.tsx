'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { ChevronRight, ChevronDown, Users, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrgUnit, User as UserType } from '@/types'
import { Avatar } from '@/components/ui/avatar-wrapper'
import { useMoveUserToUnit } from '@/lib/api/hooks/use-directory'
import { toast } from 'sonner'

interface DirectoryDragTreeProps {
  orgTree: OrgUnit[]
  onUserMoved?: (userId: string, newUnitId: string) => void
}

export function DirectoryDragTree({ orgTree, onUserMoved }: DirectoryDragTreeProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const [draggedUser, setDraggedUser] = useState<UserType | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  const { mutate: moveUser } = useMoveUserToUnit()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits)
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId)
    } else {
      newExpanded.add(unitId)
    }
    setExpandedUnits(newExpanded)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const userId = active.id as string
    
    // Find the user being dragged
    const user = findUserInTree(orgTree, userId)
    setDraggedUser(user)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over && over.id.toString().startsWith('unit-')) {
      const unitId = over.id.toString().replace('unit-', '')
      setDropTarget(unitId)
    } else {
      setDropTarget(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedUser(null)
    setDropTarget(null)

    if (!over || !over.id.toString().startsWith('unit-')) {
      return
    }

    const userId = active.id as string
    const newUnitId = over.id.toString().replace('unit-', '')

    // Get current unit
    const currentUnit = findUserUnit(orgTree, userId)
    
    if (currentUnit?.id === newUnitId) {
      return // No change
    }

    // Optimistic update would happen here
    moveUser(
      { userId, toUnitId: newUnitId },
      {
        onSuccess: () => {
          toast.success('User moved successfully')
          onUserMoved?.(userId, newUnitId)
        },
        onError: (error) => {
          toast.error('Failed to move user: ' + error.message)
        },
      }
    )
  }

  const handleDragCancel = () => {
    setDraggedUser(null)
    setDropTarget(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-1">
        {orgTree.map((unit) => (
          <OrgUnitNode
            key={unit.id}
            unit={unit}
            isExpanded={expandedUnits.has(unit.id)}
            onToggle={() => toggleUnit(unit.id)}
            isDropTarget={dropTarget === unit.id}
            level={0}
          />
        ))}
      </div>

      <DragOverlay>
        {draggedUser ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-primary-500">
            <UserItem user={draggedUser} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface OrgUnitNodeProps {
  unit: OrgUnit
  isExpanded: boolean
  onToggle: () => void
  isDropTarget: boolean
  level: number
}

function OrgUnitNode({ unit, isExpanded, onToggle, isDropTarget, level }: OrgUnitNodeProps) {
  const hasChildren = unit.children && unit.children.length > 0
  const hasMembers = unit.members && unit.members.length > 0

  return (
    <div className="select-none">
      {/* Unit header */}
      <div
        id={`unit-${unit.id}`}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer',
          isDropTarget && 'bg-primary-100 dark:bg-primary-900/20 ring-2 ring-primary-500',
          level > 0 && 'ml-6'
        )}
        onClick={onToggle}
      >
        {/* Expand/collapse icon */}
        {(hasChildren || hasMembers) && (
          <button className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </button>
        )}
        {!hasChildren && !hasMembers && <div className="w-4" />}

        {/* Unit icon */}
        <div className={cn(
          'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center',
          unit.type === 'division' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'
        )}>
          {unit.type === 'division' ? (
            <Building2 size={14} className="text-blue-500" />
          ) : (
            <Users size={14} className="text-purple-500" />
          )}
        </div>

        {/* Unit name */}
        <span className="font-medium text-sm flex-1">{unit.name}</span>

        {/* Member count */}
        {hasMembers && (
          <span className="text-xs text-gray-500">
            {unit.members.length} {unit.members.length === 1 ? 'member' : 'members'}
          </span>
        )}
      </div>

      {/* Members */}
      {isExpanded && hasMembers && (
        <div className={cn('space-y-0.5 mt-1', level > 0 && 'ml-6')}>
          {unit.members.map((member) => (
            <UserItem key={member.id} user={member} />
          ))}
        </div>
      )}

      {/* Children units */}
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {unit.children.map((child) => (
            <OrgUnitNode
              key={child.id}
              unit={child}
              isExpanded={false}
              onToggle={() => {}}
              isDropTarget={false}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface UserItemProps {
  user: UserType
  isDragging?: boolean
}

function UserItem({ user, isDragging }: UserItemProps) {
  return (
    <div
      id={user.id}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 ml-8 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
      draggable
    >
      <Avatar
        {...(user.avatar ? { src: user.avatar } : {})}
        alt={user.name}
        size="xs"
        fallback={user.name?.[0] ?? 'U'}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        {user.title && (
          <p className="text-xs text-gray-500 truncate">{user.title}</p>
        )}
      </div>
      <div className={cn(
        'w-2 h-2 rounded-full',
        user.presence === 'available' && 'bg-green-500',
        user.presence === 'busy' && 'bg-red-500',
        user.presence === 'away' && 'bg-yellow-500',
        user.presence === 'offline' && 'bg-gray-400'
      )} />
    </div>
  )
}

// Helper functions
function findUserInTree(units: OrgUnit[], userId: string): UserType | null {
  for (const unit of units) {
    const user = unit.members?.find((m) => m.id === userId)
    if (user) return user

    if (unit.children) {
      const found = findUserInTree(unit.children, userId)
      if (found) return found
    }
  }
  return null
}

function findUserUnit(units: OrgUnit[], userId: string): OrgUnit | null {
  for (const unit of units) {
    if (unit.members?.some((m) => m.id === userId)) {
      return unit
    }

    if (unit.children) {
      const found = findUserUnit(unit.children, userId)
      if (found) return found
    }
  }
  return null
}
