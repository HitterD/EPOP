/**
 * WIP (Work In Progress) Guard Engine
 * 
 * Enforces WIP limits and validates status transitions for Kanban boards
 */

export type TaskStatus = 
  | 'backlog' 
  | 'todo' 
  | 'in_progress' 
  | 'in_review' 
  | 'blocked' 
  | 'on_hold'
  | 'done' 
  | 'cancelled';

export interface WIPLimit {
  status: TaskStatus;
  limit: number;
  current: number;
}

export interface StatusTransitionRule {
  from: TaskStatus;
  to: TaskStatus[];
  requiresPermission?: boolean;
  reason?: string;
}

/**
 * Default status transition map
 */
export const STATUS_TRANSITIONS: StatusTransitionRule[] = [
  // From Backlog
  {
    from: 'backlog',
    to: ['todo', 'cancelled'],
  },
  // From Todo
  {
    from: 'todo',
    to: ['in_progress', 'backlog', 'cancelled'],
  },
  // From In Progress
  {
    from: 'in_progress',
    to: ['in_review', 'blocked', 'on_hold', 'todo'],
  },
  // From In Review
  {
    from: 'in_review',
    to: ['done', 'in_progress', 'on_hold'],
  },
  // From Blocked
  {
    from: 'blocked',
    to: ['in_progress', 'on_hold', 'cancelled'],
  },
  // From On Hold
  {
    from: 'on_hold',
    to: ['in_progress', 'todo', 'cancelled'],
  },
  // From Done
  {
    from: 'done',
    to: ['in_progress'], // Reopen
    requiresPermission: true,
    reason: 'Reopening completed tasks requires manager approval',
  },
  // From Cancelled
  {
    from: 'cancelled',
    to: ['backlog', 'todo'],
    requiresPermission: true,
    reason: 'Restoring cancelled tasks requires manager approval',
  },
];

/**
 * WIP Guard Engine
 */
export class WIPGuard {
  private limits: Map<TaskStatus, number> = new Map();
  private counts: Map<TaskStatus, number> = new Map();
  private transitions: StatusTransitionRule[];
  private overrideEnabled: boolean = false;

  constructor(
    limits: Record<TaskStatus, number> = {},
    transitions: StatusTransitionRule[] = STATUS_TRANSITIONS
  ) {
    // Set default limits
    Object.entries(limits).forEach(([status, limit]) => {
      this.limits.set(status as TaskStatus, limit);
    });

    this.transitions = transitions;
  }

  /**
   * Set current count for a status
   */
  setCount(status: TaskStatus, count: number): void {
    this.counts.set(status, count);
  }

  /**
   * Enable admin override
   */
  enableOverride(): void {
    this.overrideEnabled = true;
  }

  /**
   * Disable admin override
   */
  disableOverride(): void {
    this.overrideEnabled = false;
  }

  /**
   * Check if moving task to status would exceed WIP limit
   */
  canMove(toStatus: TaskStatus): {
    allowed: boolean;
    reason?: string;
    canOverride: boolean;
  } {
    const limit = this.limits.get(toStatus);
    const current = this.counts.get(toStatus) || 0;

    // No limit set
    if (limit === undefined) {
      return { allowed: true, canOverride: false };
    }

    // Check limit
    if (current >= limit) {
      return {
        allowed: false,
        reason: `WIP limit exceeded for ${toStatus} (${current}/${limit})`,
        canOverride: this.overrideEnabled,
      };
    }

    return { allowed: true, canOverride: false };
  }

  /**
   * Check if status transition is valid
   */
  canTransition(fromStatus: TaskStatus, toStatus: TaskStatus): {
    allowed: boolean;
    reason?: string;
    requiresPermission: boolean;
  } {
    // Same status - always allowed
    if (fromStatus === toStatus) {
      return { allowed: true, requiresPermission: false };
    }

    // Find transition rule
    const rule = this.transitions.find((r) => r.from === fromStatus);
    
    if (!rule) {
      return {
        allowed: false,
        reason: `No transition rules defined for ${fromStatus}`,
        requiresPermission: false,
      };
    }

    // Check if transition is allowed
    if (!rule.to.includes(toStatus)) {
      return {
        allowed: false,
        reason: `Cannot move from ${fromStatus} to ${toStatus}`,
        requiresPermission: false,
      };
    }

    return {
      allowed: true,
      requiresPermission: rule.requiresPermission || false,
      reason: rule.reason,
    };
  }

  /**
   * Validate move (combines WIP limit and transition check)
   */
  validateMove(
    fromStatus: TaskStatus,
    toStatus: TaskStatus
  ): {
    allowed: boolean;
    reason?: string;
    requiresPermission: boolean;
    canOverride: boolean;
  } {
    // Check transition rules
    const transitionCheck = this.canTransition(fromStatus, toStatus);
    if (!transitionCheck.allowed) {
      return {
        ...transitionCheck,
        canOverride: false,
      };
    }

    // Check WIP limits
    const wipCheck = this.canMove(toStatus);
    if (!wipCheck.allowed) {
      return {
        allowed: false,
        reason: wipCheck.reason,
        requiresPermission: false,
        canOverride: wipCheck.canOverride,
      };
    }

    return {
      allowed: true,
      requiresPermission: transitionCheck.requiresPermission,
      reason: transitionCheck.reason,
      canOverride: false,
    };
  }

  /**
   * Get WIP status for all lanes
   */
  getWIPStatus(): WIPLimit[] {
    const statuses: TaskStatus[] = [
      'backlog',
      'todo',
      'in_progress',
      'in_review',
      'blocked',
      'on_hold',
      'done',
      'cancelled',
    ];

    return statuses
      .map((status) => ({
        status,
        limit: this.limits.get(status) || 0,
        current: this.counts.get(status) || 0,
      }))
      .filter((item) => item.limit > 0);
  }
}

/**
 * React hook for WIP guard
 */
export function useWIPGuard(
  limits: Record<TaskStatus, number>,
  taskCounts: Record<TaskStatus, number>,
  isAdmin: boolean = false
) {
  const guardRef = React.useRef(new WIPGuard(limits));

  React.useEffect(() => {
    const guard = guardRef.current;
    
    // Update counts
    Object.entries(taskCounts).forEach(([status, count]) => {
      guard.setCount(status as TaskStatus, count);
    });

    // Update override
    if (isAdmin) {
      guard.enableOverride();
    } else {
      guard.disableOverride();
    }
  }, [taskCounts, isAdmin]);

  const validateMove = React.useCallback(
    (fromStatus: TaskStatus, toStatus: TaskStatus) => {
      return guardRef.current.validateMove(fromStatus, toStatus);
    },
    []
  );

  const getWIPStatus = React.useCallback(() => {
    return guardRef.current.getWIPStatus();
  }, []);

  return {
    validateMove,
    getWIPStatus,
    isAdmin,
  };
}

// React import
import React from 'react';
