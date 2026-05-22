import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../services/adminService';
import { AdminTable } from '../../components/admin/AdminTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
import { toast } from '../../components/ui/toast';
import { Promotion } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const schema = z.object({
  promo_code: z.string().min(1).toUpperCase(),
  description: z.string().optional(),
  discount_percent: z.number().min(0).max(100),
  valid_from: z.string().min(1),
  valid_to: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

function generateCode() {
  return 'PROMO' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function AdminPromotions() {
  const qc = useQueryClient();
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: promos, isLoading } = useQuery({ queryKey: ['admin-promotions'], queryFn: adminService.getPromotions });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() {
    reset({ promo_code: generateCode(), discount_percent: 10, valid_from: new Date().toISOString().split('T')[0] });
    setEditPromo(null); setShowForm(true);
  }
  function openEdit(p: Promotion) {
    setEditPromo(p);
    reset({ promo_code: p.promo_code, description: p.description, discount_percent: p.discount_percent, valid_from: p.valid_from.split('T')[0], valid_to: p.valid_to.split('T')[0] });
    setShowForm(true);
  }

  async function onSubmit(data: FormData) {
    try {
      if (editPromo) { await adminService.updatePromotion(editPromo.id, data); toast.success('Updated!'); }
      else { await adminService.createPromotion(data); toast.success('Created!'); }
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      setShowForm(false);
    } catch { toast.error('Failed to save.'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await adminService.deletePromotion(deleteId); toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['admin-promotions'] }); }
    catch { toast.error('Failed to delete.'); }
    finally { setDeleteId(null); }
  }

  const now = new Date();
  const columns = [
    { key: 'promo_code', label: 'Code', render: (p: Promotion) => <span className="font-mono font-bold">{p.promo_code}</span> },
    { key: 'description', label: 'Description', render: (p: Promotion) => p.description || '—' },
    { key: 'discount_percent', label: 'Discount', render: (p: Promotion) => `${p.discount_percent}%` },
    { key: 'valid_from', label: 'From', render: (p: Promotion) => formatDate(p.valid_from) },
    { key: 'valid_to', label: 'To', render: (p: Promotion) => formatDate(p.valid_to) },
    { key: 'times_used', label: 'Used' },
    { key: 'status', label: 'Status', render: (p: Promotion) => {
      const expired = new Date(p.valid_to) < now;
      return <Badge variant={expired ? 'danger' : 'success'}>{expired ? 'Expired' : 'Active'}</Badge>;
    }},
    { key: 'actions', label: 'Actions', render: (p: Promotion) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(p)} className="text-navy hover:text-gold"><Edit className="h-4 w-4" /></button>
        <button onClick={() => setDeleteId(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Promotions</h1>
        <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Promotion</Button>
      </div>

      <AdminTable columns={columns} data={(promos || [])} loading={isLoading} keyField="id" />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editPromo ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle></DialogHeader>
          <form className="space-y-4">
            <div>
              <Label>Promo Code</Label>
              <div className="flex gap-2 mt-1">
                <Input {...register('promo_code')} className="uppercase" />
                <Button type="button" variant="outline" size="icon" onClick={() => setValue('promo_code', generateCode())}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {errors.promo_code && <p className="text-red-500 text-xs mt-1">{errors.promo_code.message}</p>}
            </div>
            <div><Label>Description</Label><Textarea {...register('description')} className="mt-1" rows={2} /></div>
            <div><Label>Discount (%)</Label><Input type="number" min={0} max={100} {...register('discount_percent', { valueAsNumber: true })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valid From</Label><Input type="date" {...register('valid_from')} className="mt-1" /></div>
              <div><Label>Valid To</Label><Input type="date" {...register('valid_to')} className="mt-1" /></div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editPromo ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Promotion?</AlertDialogTitle><AlertDialogDescription>This promo code will be deactivated.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
