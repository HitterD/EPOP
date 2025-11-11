import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Role = 'super_admin' | 'admin' | 'manager' | 'member' | 'guest';

export type Permission =
  | 'view_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'manage_users'
  | 'view_analytics'
  | 'manage_settings'
  | 'view_audit_logs'
  | 'manage_files'
  | 'delete_files'
  | 'send_messages'
  | 'delete_messages'
  | 'create_channels'
  | 'manage_integrations'
  | 'export_data'
  | 'view_billing';

export interface PermissionDefinition {
  id: Permission;
  label: string;
  description: string;
  category: 'projects' | 'users' | 'files' | 'messages' | 'system' | 'billing';
  dangerous?: boolean;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

const permissionDefinitions: PermissionDefinition[] = [
  // Projects
  {
    id: 'view_projects',
    label: 'View Projects',
    description: 'View all projects and tasks',
    category: 'projects',
  },
  {
    id: 'edit_projects',
    label: 'Edit Projects',
    description: 'Create and edit projects and tasks',
    category: 'projects',
  },
  {
    id: 'delete_projects',
    label: 'Delete Projects',
    description: 'Delete projects permanently',
    category: 'projects',
    dangerous: true,
  },

  // Users
  {
    id: 'manage_users',
    label: 'Manage Users',
    description: 'Create, edit, and deactivate users',
    category: 'users',
    dangerous: true,
  },
  {
    id: 'view_audit_logs',
    label: 'View Audit Logs',
    description: 'Access user activity history',
    category: 'users',
  },

  // Files
  {
    id: 'manage_files',
    label: 'Manage Files',
    description: 'Upload, download, and organize files',
    category: 'files',
  },
  {
    id: 'delete_files',
    label: 'Delete Files',
    description: 'Permanently delete files',
    category: 'files',
    dangerous: true,
  },

  // Messages
  {
    id: 'send_messages',
    label: 'Send Messages',
    description: 'Send messages in channels and DMs',
    category: 'messages',
  },
  {
    id: 'delete_messages',
    label: 'Delete Messages',
    description: "Delete any user's messages",
    category: 'messages',
    dangerous: true,
  },
  {
    id: 'create_channels',
    label: 'Create Channels',
    description: 'Create new communication channels',
    category: 'messages',
  },

  // System
  {
    id: 'view_analytics',
    label: 'View Analytics',
    description: 'Access usage analytics and reports',
    category: 'system',
  },
  {
    id: 'manage_settings',
    label: 'Manage Settings',
    description: 'Configure system settings',
    category: 'system',
    dangerous: true,
  },
  {
    id: 'manage_integrations',
    label: 'Manage Integrations',
    description: 'Connect and configure third-party services',
    category: 'system',
  },
  {
    id: 'export_data',
    label: 'Export Data',
    description: 'Export all platform data',
    category: 'system',
  },

  // Billing
  {
    id: 'view_billing',
    label: 'View Billing',
    description: 'Access billing and subscription information',
    category: 'billing',
  },
];

const defaultRolePermissions: RolePermissions[] = [
  {
    role: 'super_admin',
    permissions: permissionDefinitions.map((p) => p.id),
  },
  {
    role: 'admin',
    permissions: [
      'view_projects',
      'edit_projects',
      'delete_projects',
      'manage_users',
      'view_audit_logs',
      'manage_files',
      'delete_files',
      'send_messages',
      'delete_messages',
      'create_channels',
      'view_analytics',
      'manage_integrations',
      'export_data',
    ],
  },
  {
    role: 'manager',
    permissions: [
      'view_projects',
      'edit_projects',
      'view_audit_logs',
      'manage_files',
      'send_messages',
      'create_channels',
      'view_analytics',
    ],
  },
  {
    role: 'member',
    permissions: [
      'view_projects',
      'edit_projects',
      'manage_files',
      'send_messages',
    ],
  },
  {
    role: 'guest',
    permissions: ['view_projects', 'send_messages'],
  },
];

const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
  guest: 'Guest',
};

const categoryLabels: Record<string, string> = {
  projects: 'Projects',
  users: 'User Management',
  files: 'Files',
  messages: 'Messages',
  system: 'System',
  billing: 'Billing',
};

interface RolePermissionsMatrixProps {
  initialPermissions?: RolePermissions[];
  onChange: (permissions: RolePermissions[]) => void;
  readOnly?: boolean;
}

export function RolePermissionsMatrix({
  initialPermissions = defaultRolePermissions,
  onChange,
  readOnly = false,
}: RolePermissionsMatrixProps) {
  const [permissions, setPermissions] =
    useState<RolePermissions[]>(initialPermissions);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'projects',
    'users',
  ]);

  const roles: Role[] = ['super_admin', 'admin', 'manager', 'member', 'guest'];

  const hasPermission = (role: Role, permission: Permission): boolean => {
    const rolePerms = permissions.find((p) => p.role === role);
    return rolePerms?.permissions.includes(permission) || false;
  };

  const togglePermission = (role: Role, permission: Permission) => {
    if (readOnly) return;

    // Super admin always has all permissions
    if (role === 'super_admin') return;

    setPermissions((prev) =>
      prev.map((rolePerms) => {
        if (rolePerms.role !== role) return rolePerms;

        const hasIt = rolePerms.permissions.includes(permission);
        return {
          ...rolePerms,
          permissions: hasIt
            ? rolePerms.permissions.filter((p) => p !== permission)
            : [...rolePerms.permissions, permission],
        };
      })
    );
    setHasChanges(true);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    onChange(permissions);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPermissions(initialPermissions);
    setHasChanges(false);
  };

  // Group permissions by category
  const permissionsByCategory = permissionDefinitions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Role Permissions Matrix</h2>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertCircle className="h-3 w-3" />
                <span>Unsaved changes</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        Define permissions for each role. Super Admin always has full access.
        {readOnly && ' (View only)'}
      </p>

      {/* Matrix by category */}
      <div className="space-y-4">
        {Object.entries(permissionsByCategory).map(
          ([category, perms]) => {
            const isExpanded = expandedCategories.includes(category);

            return (
              <div key={category} className="border rounded-lg overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium text-sm">
                    {categoryLabels[category]} ({perms.length})
                  </h3>
                  <span className="text-xs">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>

                {/* Category permissions table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[250px]">
                            Permission
                          </TableHead>
                          {roles.map((role) => (
                            <TableHead key={role} className="text-center">
                              {roleLabels[role]}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {perms.map((perm) => (
                          <TableRow
                            key={perm.id}
                            className={cn(perm.dangerous && 'bg-red-500/5')}
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm font-medium">
                                    {perm.label}
                                  </Label>
                                  {perm.dangerous && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-medium">
                                      Dangerous
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {perm.description}
                                </p>
                              </div>
                            </TableCell>
                            {roles.map((role) => {
                              const checked = hasPermission(role, perm.id);
                              const disabled =
                                readOnly || role === 'super_admin';

                              return (
                                <TableCell key={role} className="text-center">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                      togglePermission(role, perm.id)
                                    }
                                    disabled={disabled}
                                    aria-label={`${roleLabels[role]} - ${perm.label}`}
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500/10 border border-red-500/20" />
          <span>Dangerous permissions require extra caution</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3" />
          <span>Super Admin has all permissions by default</span>
        </div>
      </div>
    </div>
  );
}

// Hook for permission checking
export function usePermissions(
  userRole: Role,
  rolePermissions: RolePermissions[]
) {
  const hasPermission = (permission: Permission): boolean => {
    const rolePerms = rolePermissions.find((p) => p.role === userRole);
    return rolePerms?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
