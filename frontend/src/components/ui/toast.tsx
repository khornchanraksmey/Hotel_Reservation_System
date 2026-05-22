import { Toaster as SonnerToaster } from 'sonner';
export { toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-xl shadow-lg',
          success: 'bg-white border-l-4 border-green-500',
          error: 'bg-white border-l-4 border-red-500',
          warning: 'bg-white border-l-4 border-amber-500',
          info: 'bg-white border-l-4 border-navy',
        },
      }}
    />
  );
}
