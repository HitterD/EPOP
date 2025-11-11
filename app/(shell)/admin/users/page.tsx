"use client"

import { useMemo, useState } from 'react'
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser, useDeleteAdminUser } from '@/lib/api/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const { data: users = [], isLoading, error } = useAdminUsers()
  const createUser = useCreateAdminUser()
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'member' as 'admin' | 'member' })

  const editingUser = useMemo(() => users.find((u) => u.id === editingId), [users, editingId])

  const onAdd = () => {
    setEditingId(null)
    setForm({ name: '', email: '', role: 'member' })
    setOpen(true)
  }

  const onEdit = (id: string) => {
    setEditingId(id)
    const u = users.find((x) => x.id === id)
    if (u) setForm({ name: u.name, email: u.email, role: (u.role as 'admin' | 'member') || 'member' })
    setOpen(true)
  }

  const onDelete = (id: string) => {
    deleteUser.mutate(id, {
      onSuccess: () => toast.success('User deleted'),
      onError: (e: any) => toast.error(e.message || 'Delete failed'),
    })
  }

  const onSubmit = () => {
    if (!form.name || !form.email) return toast.error('Name and email are required')
    if (editingId) {
      updateUser.mutate(
        { userId: editingId, updates: { name: form.name, email: form.email, role: form.role } },
        {
          onSuccess: () => {
            toast.success('User updated')
            setOpen(false)
          },
          onError: (e: any) => toast.error(e.message || 'Update failed'),
        }
      )
    } else {
      createUser.mutate(
        { name: form.name, email: form.email, role: form.role },
        {
          onSuccess: () => {
            toast.success('User created')
            setOpen(false)
          },
          onError: (e: any) => toast.error(e.message || 'Create failed'),
        }
      )
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Admin • Users</h1>
          <p className="text-sm text-muted-foreground">Manage users and roles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => location.assign('/admin/bulk-import')}>Bulk Import</Button>
          <Button onClick={onAdd}>New User</Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Failed to load users</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(u.id)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(u.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="text-lg font-semibold">{editingId ? 'Edit User' : 'New User'}</div>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-xs mb-1">Name</div>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <div className="text-xs mb-1">Email</div>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <div className="text-xs mb-1">Role</div>
              <select className="w-full h-9 rounded border px-2" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))}>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSubmit} disabled={createUser.isPending || updateUser.isPending}>{editingId ? 'Save' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
