import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreVertical,
  Edit,
  Key,
  Mail,
  FileText,
  UserX,
  Trash2,
} from 'lucide-react';
import type { User } from '@/types/directory';

interface UserActionsMenuProps {
  user: User;
  currentUserRole: 'super_admin' | 'admin' | 'manager' | 'member';
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onSendEmail: (user: User) => void;
  onViewAuditLog: (user: User) => void;
  onDeactivate: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserActionsMenu({
  user,
  currentUserRole,
  onEdit,
  onResetPassword,
  onSendEmail,
  onViewAuditLog,
  onDeactivate,
  onDelete,
}: UserActionsMenuProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canEdit = currentUserRole === 'admin' || currentUserRole === 'super_admin';
  const canDelete = currentUserRole === 'super_admin';
  const isActive = user.status === 'active';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label={`Actions for ${user.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56"
          role="menu"
          aria-label="User actions"
        >
          {canEdit && (
            <DropdownMenuItem
              onClick={() => onEdit(user)}
              role="menuitem"
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => onResetPassword(user)}
            role="menuitem"
            className="cursor-pointer"
          >
            <Key className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onSendEmail(user)}
            role="menuitem"
            className="cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onViewAuditLog(user)}
            role="menuitem"
            className="cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            View Audit Log
          </DropdownMenuItem>

          {canEdit && (
            <>
              <DropdownMenuSeparator />

              {isActive ? (
                <DropdownMenuItem
                  onClick={() => setShowDeactivateDialog(true)}
                  role="menuitem"
                  className="cursor-pointer text-yellow-600 focus:text-yellow-600"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onDeactivate(user)}
                  role="menuitem"
                  className="cursor-pointer text-green-600 focus:text-green-600"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Reactivate
                </DropdownMenuItem>
              )}
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                role="menuitem"
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Deactivate confirmation dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivate <strong>{user.name}</strong>? They won't be able to log in,
              but their data will be retained.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeactivate(user);
                setShowDeactivateDialog(false);
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <strong>{user.name}</strong>? All their data will be
              lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(user);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
