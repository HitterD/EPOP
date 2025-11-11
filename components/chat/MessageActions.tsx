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
import { Textarea } from '@/components/ui/textarea';
import {
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Pin,
  Flag,
  Reply,
  Smile,
} from 'lucide-react';
import type { Message } from '@/types/chat';

interface MessageActionsProps {
  message: Message;
  isMine: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
}

export function MessageActions({
  message,
  isMine,
  onEdit,
  onDelete,
  onReply,
  onReact,
  onPin,
  onReport,
  canEdit = true,
  canDelete = true,
  canPin = false,
}: MessageActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  // Only allow editing within 5 minutes
  const canEditMessage = () => {
    if (!isMine || !canEdit || !onEdit) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return message.timestamp > fiveMinutesAgo;
  };

  const canDeleteMessage = () => {
    return isMine && canDelete && onDelete;
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
      setShowEditDialog(false);
    }
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    setShowDeleteDialog(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Message actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onReply && (
            <DropdownMenuItem onClick={() => onReply(message.id)}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </DropdownMenuItem>
          )}

          {onReact && (
            <DropdownMenuItem onClick={() => onReact(message.id)}>
              <Smile className="mr-2 h-4 w-4" />
              Add Reaction
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleCopyText}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </DropdownMenuItem>

          {canPin && onPin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPin(message.id)}>
                <Pin className="mr-2 h-4 w-4" />
                Pin to Channel
              </DropdownMenuItem>
            </>
          )}

          {(canEditMessage() || canDeleteMessage()) && (
            <DropdownMenuSeparator />
          )}

          {canEditMessage() && (
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}

          {canDeleteMessage() && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}

          {!isMine && onReport && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onReport(message.id)}
                className="text-destructive focus:text-destructive"
              >
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Message</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to your message. Messages can only be edited within 5
              minutes of sending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your message..."
              className="min-h-[100px]"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditContent(message.content)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEdit}
              disabled={!editContent.trim() || editContent === message.content}
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 px-4 rounded border bg-muted/50">
            <p className="text-sm line-clamp-3">{message.content}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Quick action buttons that appear on hover
export function QuickMessageActions({
  message,
  isMine,
  onReply,
  onReact,
  onEdit,
  onDelete,
}: Pick<
  MessageActionsProps,
  'message' | 'isMine' | 'onReply' | 'onReact' | 'onEdit' | 'onDelete'
>) {
  const canEdit = () => {
    if (!isMine || !onEdit) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return message.timestamp > fiveMinutesAgo;
  };

  return (
    <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1">
      {onReact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReact(message.id)}
          className="h-6 w-6 p-0"
          aria-label="React to message"
          title="React"
        >
          <Smile className="h-3.5 w-3.5" />
        </Button>
      )}

      {onReply && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReply(message.id)}
          className="h-6 w-6 p-0"
          aria-label="Reply to message"
          title="Reply"
        >
          <Reply className="h-3.5 w-3.5" />
        </Button>
      )}

      {canEdit() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Would trigger edit dialog from MessageActions
            console.log('Edit message:', message.id);
          }}
          className="h-6 w-6 p-0"
          aria-label="Edit message"
          title="Edit"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      )}

      <MessageActions
        message={message}
        isMine={isMine}
        onReply={onReply}
        onReact={onReact}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
