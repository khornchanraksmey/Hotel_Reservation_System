import { useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, ImagePlus, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../services/adminService';
import { roomService } from '../../services/roomService';
import { AdminTable } from '../../components/admin/AdminTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
import { toast } from '../../components/ui/toast';
import { Room } from '../../types';
import { formatCurrency } from '../../utils/priceUtils';
import { getImageUrl } from '../../utils/imageUtils';

const schema = z.object({
  room_number: z.string().min(1),
  room_type_id: z.number().min(1),
  floor: z.number().min(1),
  bed_type: z.string().min(1),
  size_sqm: z.number().min(1),
  max_capacity: z.number().min(1),
  price_per_night: z.number().min(0),
  description: z.string().optional(),
  status: z.enum(['available', 'occupied', 'maintenance', 'inactive']),
});

type FormData = z.infer<typeof schema>;

const statusColors: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  available: 'success', occupied: 'info' as 'default', maintenance: 'warning', inactive: 'danger',
};


export default function AdminRooms() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Image state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(images: string[], startIndex = 0) {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
  }
  function closeLightbox() { setLightboxImages([]); }
  function lightboxPrev() { setLightboxIndex(i => (i - 1 + lightboxImages.length) % lightboxImages.length); }
  function lightboxNext() { setLightboxIndex(i => (i + 1) % lightboxImages.length); }

  const params: Record<string, unknown> = { page, per_page: 20 };
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rooms', params],
    queryFn: () => adminService.getAdminRooms(params),
  });

  const { data: roomTypes } = useQuery({ queryKey: ['room-types'], queryFn: roomService.getRoomTypes });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'available', floor: 1, max_capacity: 2, size_sqm: 25, price_per_night: 100 },
  });

  function resetImageState(images: string[] = []) {
    setExistingImages(images);
    setPendingFiles([]);
    setPendingPreviews([]);
  }

  function openCreate() {
    reset({ status: 'available', floor: 1, max_capacity: 2, size_sqm: 25, price_per_night: 100 });
    setEditRoom(null);
    resetImageState();
    setShowForm(true);
  }

  function openEdit(room: Room) {
    setEditRoom(room);
    reset({
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      floor: room.floor,
      bed_type: room.bed_type,
      size_sqm: room.size_sqm,
      max_capacity: room.max_capacity,
      price_per_night: room.price_per_night,
      description: room.description,
      status: room.status,
    });
    resetImageState(room.images || []);
    setShowForm(true);
  }

  function handleCloseForm() {
    pendingPreviews.forEach(url => URL.revokeObjectURL(url));
    resetImageState();
    setShowForm(false);
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map(f => URL.createObjectURL(f));
    setPendingFiles(prev => [...prev, ...files]);
    setPendingPreviews(prev => [...prev, ...previews]);
    e.target.value = '';
  }, []);

  function removeExisting(idx: number) {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  }

  function removePending(idx: number) {
    URL.revokeObjectURL(pendingPreviews[idx]);
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
    setPendingPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(formData: FormData) {
    const payload: Record<string, unknown> = { ...formData, images: existingImages };
    try {
      let roomId: number;
      if (editRoom) {
        await adminService.updateRoom(editRoom.id, payload);
        roomId = editRoom.id;
      } else {
        const created = await adminService.createRoom(payload);
        roomId = created.id;
      }

      if (pendingFiles.length > 0) {
        let uploaded = 0;
        for (const file of pendingFiles) {
          try {
            await adminService.uploadRoomImage(roomId, file);
            uploaded++;
          } catch {
            toast.error(`Failed to upload "${file.name}"`);
          }
        }
        if (uploaded > 0) toast.success(`${uploaded} image(s) uploaded.`);
      }

      toast.success(editRoom ? 'Room updated!' : 'Room created!');
      qc.invalidateQueries({ queryKey: ['admin-rooms'] });
      handleCloseForm();
    } catch {
      toast.error('Failed to save room.');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await adminService.deleteRoom(deleteId);
      toast.success('Room deleted.');
      qc.invalidateQueries({ queryKey: ['admin-rooms'] });
    } catch {
      toast.error('Failed to delete room.');
    } finally {
      setDeleteId(null);
    }
  }

  const columns = [
    {
      key: 'images', label: 'Photo',
      render: (r: Room) => {
        const imgs = r.images || [];
        if (!imgs.length) {
          return (
            <div className="w-14 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300">
              <Images className="h-4 w-4" />
            </div>
          );
        }
        return (
          <button
            type="button"
            onClick={() => openLightbox(imgs.map(getImageUrl))}
            className="relative w-14 h-10 rounded overflow-hidden border border-gray-200 hover:ring-2 hover:ring-gold transition-all"
          >
            <img src={getImageUrl(imgs[0])} alt="" className="w-full h-full object-cover" />
            {imgs.length > 1 && (
              <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 leading-4">
                +{imgs.length - 1}
              </span>
            )}
          </button>
        );
      },
    },
    { key: 'room_number', label: 'Room #' },
    { key: 'room_type', label: 'Type', render: (r: Room) => r.room_type?.name },
    { key: 'floor', label: 'Floor' },
    { key: 'bed_type', label: 'Bed' },
    { key: 'max_capacity', label: 'Capacity' },
    { key: 'price_per_night', label: 'Price/Night', render: (r: Room) => formatCurrency(r.price_per_night) },
    { key: 'status', label: 'Status', render: (r: Room) => <Badge variant={statusColors[r.status] || 'default'}>{r.status}</Badge> },
    {
      key: 'actions', label: 'Actions',
      render: (r: Room) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-navy hover:text-gold"><Edit className="h-4 w-4" /></button>
          <button onClick={() => setDeleteId(r.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  const totalImages = existingImages.length + pendingFiles.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Room Management</h1>
        <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Room</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search rooms..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <AdminTable columns={columns} data={(data?.data || [])} loading={isLoading} keyField="id" />

      {(data?.total_pages || 1) > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="flex items-center px-4 text-sm">{page} / {data?.total_pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === data?.total_pages}>Next</Button>
        </div>
      )}

      {/* Room Form Modal */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room Number</Label>
                <Input {...register('room_number')} className="mt-1" placeholder="101" />
                {errors.room_number && <p className="text-red-500 text-xs mt-1">{errors.room_number.message}</p>}
              </div>
              <div>
                <Label>Room Type</Label>
                <select {...register('room_type_id', { valueAsNumber: true })} className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="">Select type</option>
                  {roomTypes?.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Floor</Label>
                <Input type="number" {...register('floor', { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Bed Type</Label>
                <select {...register('bed_type')} className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="">Select</option>
                  <option>Single</option><option>Double</option><option>Queen</option><option>King</option><option>Twin</option>
                </select>
              </div>
              <div>
                <Label>Size (m²)</Label>
                <Input type="number" {...register('size_sqm', { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Max Capacity</Label>
                <Input type="number" {...register('max_capacity', { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Price per Night ($)</Label>
                <Input type="number" step="0.01" {...register('price_per_night', { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <select {...register('status')} className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...register('description')} className="mt-1" rows={3} placeholder="Room description..." />
            </div>

            {/* Image Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Room Photos {totalImages > 0 && <span className="text-gray-400 font-normal">({totalImages})</span>}</Label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm text-navy hover:text-gold font-medium transition-colors"
                >
                  <ImagePlus className="h-4 w-4" />
                  Add Photos
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {totalImages === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-navy hover:text-navy transition-colors"
                >
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm">Click to upload room photos</span>
                  <span className="text-xs">JPG, PNG, WebP · max 5 MB each</span>
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {pendingPreviews.map((url, i) => (
                    <div key={`pending-${i}`} className="relative group aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gold">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gold/80 text-white text-[10px] text-center py-0.5">
                        Pending upload
                      </div>
                      <button
                        type="button"
                        onClick={() => removePending(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editRoom ? 'Update Room' : 'Create Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={e => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="h-7 w-7" />
          </button>

          {lightboxImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 text-white/70 hover:text-white bg-black/30 rounded-full p-2"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 text-white/70 hover:text-white bg-black/30 rounded-full p-2"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <img
            src={lightboxImages[lightboxIndex]}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {lightboxImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === lightboxIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
