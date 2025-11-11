export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
  extension?: string; // Phone extension number (e.g., "5555")
}

export interface OrgNode {
  id: string;
  name: string;
  type: 'department' | 'team' | 'user';
  children?: OrgNode[];
  user?: User;
  extension?: string; // Phone extension for user nodes
}

export interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export interface OrganizationTreeProps {
  tree: OrgNode[];
  onNodeClick: (node: OrgNode) => void;
}

export interface UserListViewProps {
  users: User[];
  onUserClick: (user: User) => void;
  loading?: boolean;
}

export interface AdminPanelProps {
  users: User[];
  onUserEdit: (user: User) => void;
  onUserDelete: (userId: string) => void;
}

export interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}
