import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../services/adminService';
import { AdminTable } from '../../components/admin/AdminTable';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
import { toast } from '../../components/ui/toast';
import { Amenity } from '../../types';

const schema = z.object({ name: z.string().min(1), icon: z.string().min(1) });
type FormData = z.infer<typeof schema>;

export default function AdminAmenities() {
  const qc = useQueryClient();
  const [editAmenity, setEditAmenity] = useState<Amenity | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: amenities, isLoading } = useQuery({ queryKey: ['admin-amenities'], queryFn: adminService.getAmenities });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() { reset({ name: '', icon: 'wifi' }); setEditAmenity(null); setShowForm(true); }
  function openEdit(a: Amenity) { setEditAmenity(a); reset({ name: a.name, icon: a.icon }); setShowForm(true); }

  async function onSubmit(data: FormData) {
    try {
      if (editAmenity) { await adminService.updateAmenity(editAmenity.id, data); toast.success('Updated!'); }
      else { await adminService.createAmenity(data); toast.success('Created!'); }
      qc.invalidateQueries({ queryKey: ['admin-amenities'] });
      setShowForm(false);
    } catch { toast.error('Failed to save.'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await adminService.deleteAmenity(deleteId); toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['admin-amenities'] }); }
    catch { toast.error('Cannot delete — rooms use this amenity.'); }
    finally { setDeleteId(null); }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'icon', label: 'Icon' },
    { key: 'room_count', label: 'Rooms Using' },
    {
      key: 'actions', label: 'Actions',
      render: (a: Amenity) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(a)} className="text-navy hover:text-gold"><Edit className="h-4 w-4" /></button>
          <button onClick={() => setDeleteId(a.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Amenities</h1>
        <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Amenity</Button>
      </div>

      <AdminTable columns={columns} data={(amenities || [])} loading={isLoading} keyField="id" />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAmenity ? 'Edit Amenity' : 'Add Amenity'}</DialogTitle></DialogHeader>
          <form className="space-y-4">
            <div><Label>Name</Label><Input {...register('name')} className="mt-1" placeholder="Free WiFi" />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}</div>
            <div>
              <Label>Icon Name</Label>
              <Input {...register('icon')} className="mt-1" placeholder="wifi, pool, gym, breakfast..." />
              <p className="text-xs text-gray-400 mt-1">Use: wifi, pool, gym, breakfast, parking, ac, tv, restaurant, spa</p>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editAmenity ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Amenity?</AlertDialogTitle><AlertDialogDescription>Only possible if no rooms use this amenity.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
