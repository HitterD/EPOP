import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Upload, Search } from 'lucide-react';
import { UserListView } from '@/features/directory/UserListView';
import type { AdminPanelProps } from '@/types/directory';

export function AdminPanel({ users, onUserEdit, onUserDelete }: AdminPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'active') return matchesSearch && user.status === 'active';
    if (activeTab === 'inactive') return matchesSearch && user.status === 'inactive';
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">User Administration</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 border-b space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({users.filter((u) => u.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({users.filter((u) => u.status === 'inactive').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-auto p-4">
        <UserListView
          users={filteredUsers}
          onUserClick={onUserEdit}
        />
      </div>

      {/* Stats */}
      <div className="p-4 border-t bg-muted/50">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.status === 'active').length}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">
              {users.filter((u) => u.status === 'inactive').length}
            </p>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {new Set(users.map((u) => u.department)).size}
            </p>
            <p className="text-sm text-muted-foreground">Departments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
