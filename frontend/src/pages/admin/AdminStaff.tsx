import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../services/adminService';
import { AdminTable } from '../../components/admin/AdminTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
import { toast } from '../../components/ui/toast';
import { Staff } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().optional(),
  role: z.string().min(1),
  status: z.enum(['active', 'inactive']),
  hire_date: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const ROLES = ['Receptionist', 'Housekeeping', 'Manager', 'Concierge', 'Security', 'Chef', 'Maintenance'];

export default function AdminStaff() {
  const qc = useQueryClient();
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({ queryKey: ['admin-staff', page], queryFn: () => adminService.getStaff({ page, per_page: 20 }) });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() { reset({ status: 'active', hire_date: new Date().toISOString().split('T')[0] }); setEditStaff(null); setShowForm(true); }
  function openEdit(s: Staff) { setEditStaff(s); reset({ first_name: s.first_name, last_name: s.last_name, email: s.email, phone_number: s.phone_number, role: s.role, status: s.status, hire_date: s.hire_date }); setShowForm(true); }

  async function onSubmit(data: FormData) {
    try {
      if (editStaff) { await adminService.updateStaff(editStaff.id, data); toast.success('Staff updated!'); }
      else { await adminService.createStaff(data); toast.success('Staff added!'); }
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
      setShowForm(false);
    } catch { toast.error('Failed to save.'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await adminService.deleteStaff(deleteId); toast.success('Staff removed.'); qc.invalidateQueries({ queryKey: ['admin-staff'] }); }
    catch { toast.error('Failed to remove.'); }
    finally { setDeleteId(null); }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (s: Staff) => `${s.first_name} ${s.last_name}` },
    { key: 'email', label: 'Email' },
    { key: 'phone_number', label: 'Phone', render: (s: Staff) => s.phone_number || '—' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', render: (s: Staff) => <Badge variant={s.status === 'active' ? 'success' : 'danger'}>{s.status}</Badge> },
    { key: 'hire_date', label: 'Hire Date', render: (s: Staff) => formatDate(s.hire_date) },
    { key: 'actions', label: 'Actions', render: (s: Staff) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(s)} className="text-navy hover:text-gold"><Edit className="h-4 w-4" /></button>
        <button onClick={() => setDeleteId(s.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Staff Management</h1>
        <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Staff</Button>
      </div>

      <AdminTable columns={columns} data={(data?.data || [])} loading={isLoading} keyField="id" />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editStaff ? 'Edit Staff' : 'Add Staff'}</DialogTitle></DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input {...register('first_name')} className="mt-1" />{errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}</div>
              <div><Label>Last Name</Label><Input {...register('last_name')} className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" {...register('email')} className="mt-1" /></div>
              <div><Label>Phone</Label><Input {...register('phone_number')} className="mt-1" /></div>
              <div>
                <Label>Role</Label>
                <select {...register('role')} className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="">Select role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select {...register('status')} className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div><Label>Hire Date</Label><Input type="date" {...register('hire_date')} className="mt-1" /></div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editStaff ? 'Update' : 'Add Staff'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove Staff?</AlertDialogTitle><AlertDialogDescription>This will deactivate the staff member.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
