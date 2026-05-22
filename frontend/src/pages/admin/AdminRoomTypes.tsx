import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, BedDouble } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from '../../components/ui/toast';
import { RoomType } from '../../types';
import { formatCurrency } from '../../utils/priceUtils';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  base_price: z.number().min(0),
  max_capacity: z.number().min(1),
});
type FormData = z.infer<typeof schema>;

export default function AdminRoomTypes() {
  const qc = useQueryClient();
  const [editType, setEditType] = useState<RoomType | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: roomTypes, isLoading } = useQuery({ queryKey: ['admin-room-types'], queryFn: adminService.getRoomTypes });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() { reset({ base_price: 100, max_capacity: 2 }); setEditType(null); setShowForm(true); }
  function openEdit(rt: RoomType) { setEditType(rt); reset({ name: rt.name, description: rt.description, base_price: rt.base_price, max_capacity: rt.max_capacity }); setShowForm(true); }

  async function onSubmit(data: FormData) {
    try {
      if (editType) { await adminService.updateRoomType(editType.id, data); toast.success('Updated!'); }
      else { await adminService.createRoomType(data); toast.success('Created!'); }
      qc.invalidateQueries({ queryKey: ['admin-room-types'] });
      setShowForm(false);
    } catch { toast.error('Failed to save.'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await adminService.deleteRoomType(deleteId); toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['admin-room-types'] }); }
    catch { toast.error('Cannot delete — rooms are using this type.'); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Room Types</h1>
        <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Type</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(roomTypes || []).map(rt => (
            <div key={rt.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-navy/10 rounded-lg p-2"><BedDouble className="h-5 w-5 text-navy" /></div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(rt)} className="text-navy hover:text-gold"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(rt.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <h3 className="font-serif font-semibold text-navy">{rt.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{rt.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div><span className="text-gray-400">Base Price</span><p className="font-semibold text-navy">{formatCurrency(rt.base_price)}</p></div>
                <div><span className="text-gray-400">Max Guests</span><p className="font-semibold text-navy">{rt.max_capacity}</p></div>
                {rt.room_count !== undefined && (
                  <div><span className="text-gray-400">Rooms</span><p className="font-semibold text-navy">{rt.room_count}</p></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editType ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle></DialogHeader>
          <form className="space-y-4">
            <div><Label>Name</Label><Input {...register('name')} className="mt-1" />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}</div>
            <div><Label>Description</Label><Textarea {...register('description')} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Base Price ($)</Label><Input type="number" step="0.01" {...register('base_price', { valueAsNumber: true })} className="mt-1" /></div>
              <div><Label>Max Capacity</Label><Input type="number" {...register('max_capacity', { valueAsNumber: true })} className="mt-1" /></div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editType ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Room Type?</AlertDialogTitle><AlertDialogDescription>Only possible if no rooms use this type.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
