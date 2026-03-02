import { toast } from 'sonner';

export function showSuccess(message: string) {
  toast.success(message);
}

export function showError(message: string, error?: unknown) {
  const errorMsg = error instanceof Error ? error.message : message;
  toast.error(errorMsg);
}

export function showLoading(message: string) {
  return toast.loading(message);
}

export function updateToast(toastId: string | number, message: string) {
  toast.success(message, {
    id: toastId,
  });
}
